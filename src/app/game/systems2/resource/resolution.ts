import { untuple } from "@/app/utils/collections";

import { EcsPlugin, PluginApp } from "@/app/ecs";
import {
  ChangeTrackers,
  DiffMut,
  Fresh,
  Has,
  HasAll,
  MapQuery,
  Mut,
  Opt,
  Query,
  Read,
  Single,
  Value,
} from "@/app/ecs/query";
import { System } from "@/app/ecs/system";

import { DeltaExtractor } from "../core";
import { EffectValueResolver } from "../effects/ecs";

import { Resource } from "../types/common";
import { Unlocked } from "../unlock/types";
import { Timer, TickTimer } from "../time/types";

import * as E from "../effects/types";
import * as R from "./types";

const ResolveLimitAndDeltaEffects = System(
  Query(Value(R.DeltaEffect)).filter(Fresh(R.DeltaEffect)),
  Query(Value(R.LimitEffect)).filter(Fresh(R.LimitEffect)),
  EffectValueResolver(),
)((deltasQuery, limitsQuery, values) => {
  values.resolveByEffectIds(untuple(deltasQuery));
  values.resolveByEffectIds(untuple(limitsQuery));
});

const UpdateEffectTargets = System(
  Query(DiffMut(R.Limit), Value(R.LimitEffect)).filter(Has(Resource)),
  Query(DiffMut(R.Delta), Value(R.DeltaEffect)).filter(Has(Resource)),
  MapQuery(Value(E.NumberEffect), Read(E.NumberValue)).filter(
    Fresh(E.NumberValue),
  ),
)((limits, deltas, numbers) => {
  for (const [limit, effect] of limits) {
    const value = numbers.get(effect);
    if (value) {
      limit.value = value.value ?? 0;
    }
  }
  for (const [delta, effect] of deltas) {
    const value = numbers.get(effect);
    if (value) {
      delta.value = value.value ?? 0;
    }
  }
});

const ProcessLedger = System(
  Single(Read(Timer)).filter(Has(TickTimer)),
  Query(
    Read(R.LedgerEntry),
    Opt(Value(R.Delta)),
    Opt(Value(R.Limit)),
    DiffMut(R.Amount),
  ),
)(([{ delta: dt }], query) => {
  for (const [ledgerEntry, delta, limit, amount] of query) {
    let { debit, credit } = ledgerEntry;
    if (delta !== undefined) {
      if (delta > 0) {
        debit += delta * dt;
      } else {
        credit += delta * dt;
      }
    }
    if (debit !== 0 || credit !== 0) {
      amount.value = calculateAmount(amount.value, debit, credit, limit);
    }
  }
});

function calculateAmount(
  currentAmount: number,
  debit: number,
  credit: number,
  limit: number | undefined,
): number {
  const effectiveLimit = limit ?? Number.POSITIVE_INFINITY;

  // subtract losses first
  let newAmount = currentAmount - credit;

  if (newAmount < effectiveLimit) {
    // new resources are gained only when under limit
    newAmount += debit;

    // but they only go up to limit at most
    newAmount = Math.min(newAmount, effectiveLimit);
  }

  // negative resource amount is nonsense (for now)
  newAmount = Math.max(newAmount, 0);

  return newAmount;
}

const UnlockByQuantity = System(
  Query(ChangeTrackers(R.Amount), Mut(Unlocked)).filter(
    HasAll(Resource, R.UnlockOnFirstQuantity),
  ),
)((amounts) => {
  for (const [trackers, unlocked] of amounts) {
    if (
      !unlocked.value &&
      trackers.isAddedOrChanged() &&
      trackers.value().value > 0
    ) {
      unlocked.value = true;
    }
  }
});

const UnlockByCapacity = System(
  Query(ChangeTrackers(R.Limit), Mut(Unlocked)).filter(
    HasAll(Resource, R.UnlockOnFirstCapacity),
  ),
)((limits) => {
  for (const [trackers, unlock] of limits) {
    if (
      !unlock.value &&
      trackers.isAddedOrChanged() &&
      trackers.value().value > 0
    ) {
      unlock.value = true;
    }
  }
});

const ResourceExtractor = DeltaExtractor(Value(Resource))(
  (schema, [id]) => schema.resources[id],
);

const Extractors = [
  ResourceExtractor(R.Amount, (resource, { value: amount }) => {
    resource.amount = amount;
  }),
  ResourceExtractor(Unlocked, (resource, { value: unlocked }) => {
    resource.unlocked = unlocked;
  }),
];

const CleanupLedger = System(Query(DiffMut(R.LedgerEntry)))((entries) => {
  for (const [entry] of entries) {
    entry.debit = 0;
    entry.credit = 0;
  }
});

export class ResourceResolutionPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app
      .addSystems([
        ResolveLimitAndDeltaEffects,
        UpdateEffectTargets,
        ProcessLedger,
        UnlockByQuantity,
        UnlockByCapacity,
      ])
      .addSystems(Extractors, { stage: "last-start" })
      .addSystem(CleanupLedger, { stage: "last-end" });
  }
}
