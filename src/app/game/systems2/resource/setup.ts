import { EcsComponent, EcsPlugin, PluginApp } from "@/app/ecs";
import { Commands } from "@/app/ecs/query";
import { System } from "@/app/ecs/system";
import { ResourceMetadataType, UnlockMode, Meta } from "@/app/state";

import { Unlocked } from "../types";
import * as R from "./types";

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

export class ResourceSetupPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app.addStartupSystem(SpawnResources);
  }
}
