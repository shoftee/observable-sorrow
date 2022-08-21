import { EcsPlugin, PluginApp } from "@/app/ecs";
import { DiffMut, Opt, Query, Read, Value } from "@/app/ecs/query";
import { System } from "@/app/ecs/system";

import { DeltaRecorder, Unlocked } from "../types";
import * as R from "./types";

const ProcessLedger = System(
  Query(DiffMut(R.Amount), Opt(Value(R.Capacity)), Read(R.LedgerEntry)),
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

      amount.value = newAmount;
    }
  }
});

const CleanupLedger = System(Query(DiffMut(R.LedgerEntry)))((query) => {
  for (const [entry] of query.all()) {
    entry.debit = 0;
    entry.credit = 0;
  }
});

const DeltaRecorders = [
  DeltaRecorder(
    R.Amount,
    Value(R.Id),
  )((root, { value: amount }, [id]) => {
    root.resources[id].amount = amount;
  }),
  DeltaRecorder(
    Unlocked,
    Value(R.Id),
  )((root, { value: unlocked }, [id]) => {
    root.resources[id].unlocked = unlocked;
  }),
];

export class ResourceResolutionPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app
      .addSystem(ProcessLedger)
      .addSystems(DeltaRecorders, { stage: "last-start" })
      .addSystem(CleanupLedger, { stage: "last-end" });
  }
}
