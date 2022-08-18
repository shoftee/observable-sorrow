import { EcsComponent, EcsPlugin, PluginApp } from "@/app/ecs";
import { Commands, Mut, Opt, Query, Read, Value } from "@/app/ecs/query";
import { System } from "@/app/ecs/system";
import { Meta, ResourceMetadataType, UnlockMode } from "@/app/state";

import { ChangeTrackingSystem, Unlocked } from "./types";
import * as R from "./types/resources";

function* componentsFromMeta(
  meta: ResourceMetadataType,
): Iterable<EcsComponent> {
  yield new R.Id(meta.id);
  yield new R.Amount();
  yield new R.LedgerEntry();
  yield new Unlocked(false);
  if (meta.unlockMode === UnlockMode.FirstCapacity) {
    yield new R.UnlockOnFirstCapacity();
  } else {
    yield new R.UnlockOnFirstQuantity();
  }
}

const SpawnResources = System(Commands())((cmds) => {
  for (const meta of Meta.resources()) {
    cmds.spawn(...componentsFromMeta(meta));
  }
});

const ProcessLedger = System(
  Query(Mut(R.Amount), Opt(Value(R.Capacity)), Read(R.LedgerEntry)),
)((query) => {
  for (const [amount, capacity, { debit, credit }] of query.all()) {
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

      if (newAmount !== oldAmount) {
        amount.value = newAmount;
      }
    }
  }
});

const CleanupLedger = System(Query(Mut(R.LedgerEntry)))((query) => {
  for (const [entry] of query.all()) {
    entry.debit = 0;
    entry.credit = 0;
  }
});

const TrackAmount = ChangeTrackingSystem(
  R.Id,
  R.Amount,
  (root, { value: amount }, { value: id }) => {
    root.resources[id].amount = amount;
  },
);

const TrackUnlocked = ChangeTrackingSystem(
  R.Id,
  Unlocked,
  (root, { value: unlocked }, { value: id }) => {
    root.resources[id].unlocked = unlocked;
  },
);

export class ResourceSetupPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app.addStartupSystem(SpawnResources);
  }
}

export class ResourceResolutionPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app
      .addSystem(ProcessLedger)
      .addSystems([TrackAmount, TrackUnlocked], { stage: "last-start" })
      .addSystem(CleanupLedger, { stage: "last-end" });
  }
}
