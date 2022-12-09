import { MapQuery, Value, Tuple, Opt, DiffMut } from "@/app/ecs/query";
import { ResourceId } from "@/app/interfaces";
import { Ledger, ResourceMap } from "@/app/state";

import { Amount, Limit, LedgerEntry } from "../resource/types";
import { Resource } from "../types/common";

export const ResourceMapQuery = MapQuery(
  Value(Resource),
  Tuple(Value(Amount), Opt(Value(Limit)), DiffMut(LedgerEntry)),
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
  [Symbol.iterator](): IterableIterator<[ResourceId, ResourceTuple]>;
  get(id: ResourceId): ResourceTuple | undefined;
};

export function createLedger(resources: ResourceTupleMap) {
  const ambient = new Ledger();
  for (const [id, [, , entry]] of resources) {
    ambient.add(id, entry);
  }
  return ambient;
}

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

    const [amount, limit] = resources.get(id)!;
    if (limit) {
      const debit = transaction.getDebit(id);
      const credit = transaction.getCredit(id);
      const total = amount + debit - credit;

      // if total > limit, record only the part until cap.
      rewards.set(id, Math.min(limit, total) - amount);
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
