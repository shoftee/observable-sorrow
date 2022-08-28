import { MapQuery, Value, All, Opt, DiffMut } from "@/app/ecs/query";
import { ResourceId } from "@/app/interfaces";
import { Ledger, ResourceMap } from "@/app/state";

import { Amount, Capacity, LedgerEntry } from "../resource/types";
import { Resource } from "../types/common";

export const ResourceMapQuery = MapQuery(
  Value(Resource),
  All(Value(Amount), Opt(Value(Capacity)), DiffMut(LedgerEntry)),
);

type Order = Partial<{
  readonly debits: ResourceMap;
  readonly credits: ResourceMap;
}>;

type ResourceTuple = [
  Readonly<number>,
  Readonly<number> | undefined,
  LedgerEntry,
];

type OrderHandlers = Partial<{
  success(rewards: ResourceMap): void;
  failure(): void;
}>;

type ResourceTupleMap = {
  get(id: ResourceId): ResourceTuple | undefined;
};

export function applyOrder(
  order: Order,
  ambient: Ledger,
  resources: ResourceTupleMap,
  handlers?: OrderHandlers,
) {
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
      const [, , entry] = resources.get(id)!;
      entry.debit += change.debit;
      entry.credit += change.credit;
    }

    transaction.rebase();
    handlers?.success?.(rewards);
  } else {
    handlers?.failure?.();
  }
}
