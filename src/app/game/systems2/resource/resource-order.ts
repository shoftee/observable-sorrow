import { EcsPlugin, PluginApp } from "@/app/ecs";
import { All, DiffMut, MapQuery, Opt, Receive, Value } from "@/app/ecs/query";
import { System } from "@/app/ecs/system";

import { Ledger, ResourceMap } from "@/app/state";
import { cache } from "@/app/utils/collections";

import * as R from "./types";
import * as events from "../types/events";

const ProcessResourceOrders = System(
  Receive(events.ResourceOrder),
  MapQuery(
    Value(R.Id),
    All(Value(R.Amount), Opt(Value(R.Capacity)), DiffMut(R.LedgerEntry)),
  ),
)((orders, resourcesQuery) => {
  const resourcesCache = cache(() => resourcesQuery.map());
  const ambientCache = cache(() => {
    // Initialize the ambient deltas.
    const ambient = new Ledger();
    for (const [id, values] of resourcesCache.retrieve()) {
      ambient.add(id, values[2]);
    }
    return ambient;
  });

  for (const order of orders.pull()) {
    const resources = resourcesCache.retrieve();
    const ambient = ambientCache.retrieve();

    // Create delta layer for this order.
    // If the order fails, we can safely discard the whole layer.
    const transaction = new Ledger(ambient);

    // Determine if credits put us in the negatives.
    // NOTE: Some transactions are "free" and have no credits.
    for (const [id, credit] of order.credits ?? []) {
      transaction.addCredit(id, credit);

      const [amount] = resources.get(id)!;
      if (amount < credit) {
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
        const total = amount + debit - credit;

        // if total > capacity, record only the part until cap.
        rewards.set(id, Math.min(capacity, total) - amount);
      } else {
        // resources that are uncapped are always fulfilled completely.
        rewards.set(id, quantity);
      }
    }

    if (rewards) {
      // Apply changes to base resource deltas.
      for (const [id, change] of transaction.entries()) {
        const entry = resources.get(id)![2];
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
