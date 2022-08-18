import { EcsPlugin, PluginApp } from "@/app/ecs";
import { ChangeTrackers, Mut, Query, With } from "@/app/ecs/query";
import { System } from "@/app/ecs/system";

import { Unlocked } from "./types";
import * as R from "./types/resources";

const UnlockResources = System(
  Query(ChangeTrackers(R.Amount), Mut(Unlocked)).filter(
    With(R.UnlockOnFirstQuantity),
  ),
  Query(ChangeTrackers(R.Capacity), Mut(Unlocked)).filter(
    With(R.UnlockOnFirstCapacity),
  ),
)((quantityQuery, capacityQuery) => {
  for (const [trackers, unlock] of quantityQuery.all()) {
    if (
      !unlock.value &&
      trackers.isAddedOrChanged() &&
      trackers.value().value > 0
    ) {
      unlock.value = true;
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

export class UnlocksPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app.addSystem(UnlockResources);
  }
}
