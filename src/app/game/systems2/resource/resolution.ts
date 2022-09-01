import { NumberEffectId } from "@/app/interfaces";

import { EcsPlugin, PluginApp } from "@/app/ecs";
import {
  ChangeTrackers,
  DiffMut,
  Has,
  Mut,
  Opt,
  Query,
  Read,
  Single,
  Value,
} from "@/app/ecs/query";
import { System } from "@/app/ecs/system";

import { DeltaExtractor } from "../core";
import { NumberTrackersQuery } from "../effects/ecs";
import { RecalculateByQuery } from "../effects/calculation";

import { Resource } from "../types/common";
import { Unlocked } from "../unlock/types";
import { Timer, TickTimer } from "../time/types";

import * as R from "./types";

const UpdateLimitEffects = RecalculateByQuery(Value(R.LimitEffect));
const UpdateDeltaEffects = RecalculateByQuery(Value(R.DeltaEffect));

const UpdateEffectTargets = System(
  Query(DiffMut(R.Limit), Value(R.LimitEffect)).filter(Has(Resource)),
  Query(DiffMut(R.Delta), Value(R.DeltaEffect)).filter(Has(Resource)),
  NumberTrackersQuery,
)((limits, deltas, numbers) => {
  function update(effect: NumberEffectId, component: { set value(v: number) }) {
    const tracker = numbers.get(effect);
    if (tracker && tracker.isAddedOrChanged()) {
      const effectValue = tracker.value().value;
      if (effectValue) {
        component.value = effectValue;
      }
    }
  }

  for (const [limit, effect] of limits) {
    update(effect, limit);
  }
  for (const [delta, effect] of deltas) {
    update(effect, delta);
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
    Has(Resource, R.UnlockOnFirstQuantity),
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
    Has(Resource, R.UnlockOnFirstCapacity),
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
        UpdateLimitEffects,
        UpdateDeltaEffects,
        UpdateEffectTargets,
        ProcessLedger,
        UnlockByQuantity,
        UnlockByCapacity,
      ])
      .addSystems(Extractors, { stage: "last-start" })
      .addSystem(CleanupLedger, { stage: "last-end" });
  }
}
