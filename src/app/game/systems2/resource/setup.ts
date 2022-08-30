import { ResourceMetadataType, UnlockMode, Meta } from "@/app/state";

import { EcsComponent, EcsPlugin, PluginApp } from "@/app/ecs";
import { Commands } from "@/app/ecs/query";
import { System } from "@/app/ecs/system";

import { Resource } from "../types/common";
import { Unlocked } from "../unlock/types";

import * as R from "./types";

function* resourceComponents(
  meta: ResourceMetadataType,
): Iterable<EcsComponent> {
  yield new Resource(meta.id);
  yield new R.Amount();
  yield new R.LedgerEntry();
  if (meta.effects) {
    if (meta.effects.limit) {
      yield new R.Limit();
      yield new R.LimitEffect(meta.effects.limit);
    }
    if (meta.effects.delta) {
      yield new R.Delta();
      yield new R.DeltaEffect(meta.effects.delta);
    }
  }

  yield new Unlocked(false);
  if (meta.unlockMode === UnlockMode.FirstCapacity) {
    yield new R.UnlockOnFirstCapacity();
  } else {
    yield new R.UnlockOnFirstQuantity();
  }
}

const SpawnResources = System(Commands())((cmds) => {
  for (const meta of Meta.resources()) {
    cmds.spawn(...resourceComponents(meta));
  }
});

export class ResourceSetupPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app.addStartupSystem(SpawnResources);
  }
}
