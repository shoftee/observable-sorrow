import { EcsPlugin, PluginApp } from "@/app/ecs";
import { Commands, Mut, Opt, Query, Read } from "@/app/ecs/query";
import { System } from "@/app/ecs/system";
import { Meta } from "@/app/state";

import { ChangeTrackingSystem, Unlock } from "./types";
import * as R from "./types/resources";

const SpawnResources = System(Commands())((cmds) => {
  for (const meta of Meta.resources()) {
    cmds.spawn(
      new R.Id(meta.id),
      new R.Amount(),
      new R.Delta(),
      new R.LedgerEntry(),
      new Unlock(false),
    );
  }
});

const ProcessLedger = System(
  Query(Mut(R.Amount), Opt(Read(R.Capacity)), Read(R.LedgerEntry)),
)((query) => {
  for (const [amount, capacity, { debit, credit }] of query.all()) {
    if (debit !== 0 || credit !== 0) {
      const effectiveCapacity = capacity?.value ?? Number.POSITIVE_INFINITY;
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
  (root, { id }, amount) => {
    const resource = root.resources[id];
    resource.amount = amount.value;
  },
);

const TrackUnlocked = ChangeTrackingSystem(
  R.Id,
  Unlock,
  (root, { id }, unlocked) => {
    root.resources[id].unlocked = unlocked.unlocked;
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
