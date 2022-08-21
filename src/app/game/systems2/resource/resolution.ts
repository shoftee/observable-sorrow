import { EcsPlugin, PluginApp } from "@/app/ecs";
import {
  ChangeTrackers,
  DiffMut,
  Every,
  Mut,
  Opt,
  Query,
  Read,
  Value,
} from "@/app/ecs/query";
import { System } from "@/app/ecs/system";

import { DeltaRecorder, Resource, Unlocked } from "../types";
import * as R from "./types";

const ProcessLedger = System(
  Query(Read(R.LedgerEntry), Opt(Value(R.Capacity)), DiffMut(R.Amount)),
)((query) => {
  for (const [{ debit, credit }, capacity, amount] of query.all()) {
    if (debit !== 0 || credit !== 0) {
      const effectiveCapacity = capacity ?? Number.POSITIVE_INFINITY;
      const oldAmount = amount.value;

      // subtract losses first
      let newAmount = oldAmount - credit;
      if (newAmount < effectiveCapacity) {
        // new resources are gained only when under capacity
        newAmount = newAmount + debit;

        // but they only go up to capacity at most
        newAmount = Math.min(newAmount, effectiveCapacity);
      }

      // negative resource amount is nonsense (for now)
      newAmount = Math.max(newAmount, 0);

      amount.value = newAmount;
    }
  }
});

const UnlockResources = System(
  Query(ChangeTrackers(R.Amount), Mut(Unlocked)).filter(
    Every(R.UnlockOnFirstQuantity),
  ),
  Query(ChangeTrackers(R.Capacity), Mut(Unlocked)).filter(
    Every(R.UnlockOnFirstCapacity),
  ),
)((quantityQuery, capacityQuery) => {
  for (const [trackers, unlocked] of quantityQuery.all()) {
    if (
      !unlocked.value &&
      trackers.isAddedOrChanged() &&
      trackers.value().value > 0
    ) {
      unlocked.value = true;
    }
  }
  for (const [trackers, unlock] of capacityQuery.all()) {
    if (
      !unlock.value &&
      trackers.isAddedOrChanged() &&
      trackers.value().value > 0
    ) {
      unlock.value = true;
    }
  }
});

const DeltaRecorders = [
  DeltaRecorder(
    R.Amount,
    Value(Resource),
  )((root, { value: amount }, [id]) => {
    root.resources[id].amount = amount;
  }),
  DeltaRecorder(
    Unlocked,
    Value(Resource),
  )((root, { value: unlocked }, [id]) => {
    root.resources[id].unlocked = unlocked;
  }),
];

const CleanupLedger = System(Query(DiffMut(R.LedgerEntry)))((query) => {
  for (const [entry] of query.all()) {
    entry.debit = 0;
    entry.credit = 0;
  }
});

export class ResourceResolutionPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app
      .addSystem(ProcessLedger)
      .addSystem(UnlockResources)
      .addSystems(DeltaRecorders, { stage: "last-start" })
      .addSystem(CleanupLedger, { stage: "last-end" });
  }
}
