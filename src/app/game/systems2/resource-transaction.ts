import { EcsPlugin, PluginApp } from "@/app/ecs";
import { Mut, Opt, Query, Read, Receive } from "@/app/ecs/query";
import { System } from "@/app/ecs/system";
import { Ledger as Ledger, ResourceMap } from "@/app/state";
import { Enumerable } from "@/app/utils/enumerable";

import * as R from "./types/resources";
import * as events from "./types/events";

const ProcessResourceOrders = System(
  Receive(events.ResourceOrder),
  Query(Read(R.Id), Read(R.Amount), Opt(Read(R.Capacity)), Mut(R.LedgerEntry)),
)((ordersReceiver, query) => {
  const orders = Array.from(ordersReceiver.pull());
  if (orders.length === 0) {
    return;
  }

  const resources = new Enumerable(query.all()).toMap(
    (p) => p[0].id,
    (p) => [p[1], p[2]] as const,
  );
  const ledgerEntries = new Enumerable(query.all()).toMap(
    (p) => p[0].id,
    (p) => p[3],
  );

  // Initialize the ambient deltas.
  const ambient = new Ledger();
  for (const [id, entry] of ledgerEntries) {
    ambient.add(id, entry);
  }

  for (const order of orders) {
    // Create delta layer for this order.
    // If the order fails, we can safely discard the whole layer.
    const transaction = new Ledger(ambient);

    // Determine if credits put us in the negatives.
    // NOTE: Some transactions are "free" and have no credits.
    for (const [id, credit] of order.credits ?? []) {
      transaction.addCredit(id, credit);

      const [amount] = resources.get(id)!;
      if (amount.value < credit) {
        return undefined;
      }
    }

    const rewards = new ResourceMap();

    // Lack of space will never cause a transactions to fail.
    // However, we want to collect fulfillment information.
    for (const [id, quantity] of order.debits ?? []) {
      transaction.addDebit(id, quantity);

      const [amount, capacity] = resources.get(id)!;
      if (capacity) {
        const debit = transaction.getDebit(id);
        const credit = transaction.getCredit(id);
        const total = amount.value + debit - credit;

        // if total > capacity, record only the part until cap.
        rewards.set(id, Math.min(capacity.value, total) - amount.value);
      } else {
        // resources that are uncapped are always fulfilled completely.
        rewards.set(id, quantity);
      }
    }

    if (rewards) {
      // Apply changes to base resource deltas.
      for (const [id, change] of transaction.entries()) {
        const entry = ledgerEntries.get(id)!;
        entry.debit += change.debit;
        entry.credit += change.credit;
      }

      transaction.rebase();
      // TODO: dispatch success event
    } else {
      // TODO: dispatch failure event
    }
  }
});

export class ResourceOrderPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app.registerEvent(events.ResourceOrder).addSystem(ProcessResourceOrders);
  }
}
