import { cache } from "@/app/utils/cache";

import { ResourceId } from "@/app/interfaces";
import { Ledger, ResourceMap } from "@/app/state";

import { inspectable } from "@/app/ecs";
import { MapQuery, Value, Opt, DiffMut, Keyed } from "@/app/ecs/query";
import { SystemParamDescriptor } from "@/app/ecs/query/types";

import { Amount, Limit, LedgerEntry } from "../resource/types";
import { Resource } from "../types/common";

export const ResourceMapQuery = MapQuery(
  Value(Resource),
  Keyed({
    amount: Value(Amount),
    limit: Opt(Value(Limit)),
    ledgerEntry: DiffMut(LedgerEntry),
  }),
);

type Order = Partial<{
  readonly debits: ResourceMap;
  readonly credits: ResourceMap;
}>;

type ResourceTuple = {
  amount: number;
  limit: number | undefined;
  ledgerEntry: LedgerEntry;
};

type OrderHandlers = Partial<{
  success(rewards: ResourceMap): void;
  failure(): void;
}>;

type ResourceTupleMap = Iterable<[ResourceId, ResourceTuple]> & {
  get(id: ResourceId): ResourceTuple | undefined;
};

type ResourceLedger = {
  applyOrder(order: Order, handlers?: OrderHandlers): void;
};
export function ResourceLedger(): SystemParamDescriptor<ResourceLedger> {
  return {
    inspect() {
      return inspectable(ResourceLedger, [ResourceMapQuery]);
    },
    create(world) {
      const resourcesQuery = ResourceMapQuery.create(world);

      const ledgerCache = cache(
        () => new ResourceLedgerImpl(resourcesQuery.fetch()),
      );

      return {
        fetch() {
          return {
            applyOrder(order, handlers) {
              // Only hit cache if applyOrder is called.
              ledgerCache.retrieve().applyOrder(order, handlers);
            },
          };
        },
        cleanup() {
          ledgerCache.invalidate();
          resourcesQuery.cleanup?.();
        },
      };
    },
  };
}

class ResourceLedgerImpl implements ResourceLedger {
  private readonly ambient = new Ledger();

  constructor(private readonly resources: ResourceTupleMap) {
    for (const [id, { ledgerEntry }] of resources) {
      this.ambient.add(id, ledgerEntry);
    }
  }

  applyOrder(order: Order, handlers?: OrderHandlers) {
    // Create delta layer for this order.
    // If the order fails, we can safely discard the whole layer.
    const transaction = new Ledger(this.ambient);

    // Determine if credits put us in the negatives.
    // NOTE: Some transactions are "free" and have no credits.
    for (const [id, credit] of order.credits ?? []) {
      transaction.addCredit(id, credit);

      const { amount } = this.resources.get(id)!;
      if (amount < credit) {
        return undefined;
      }
    }

    const rewards = new ResourceMap();

    // Lack of space will never cause a transactions to fail.
    // However, we want to collect fulfillment information.
    for (const [id, quantity] of order.debits ?? []) {
      transaction.addDebit(id, quantity);

      const { amount, limit } = this.resources.get(id)!;
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
        const { ledgerEntry } = this.resources.get(id)!;
        ledgerEntry.debit += change.debit;
        ledgerEntry.credit += change.credit;
      }

      transaction.rebase();
      handlers?.success?.(rewards);
    } else {
      handlers?.failure?.();
    }
  }
}
