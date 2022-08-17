import { EcsPlugin, PluginApp } from "@/app/ecs";
import { ChangeTrackers, Mut, Query, With } from "@/app/ecs/query";
import { System } from "@/app/ecs/system";
import { Unlock } from "./types";
import * as R from "./types/resources";

const UnlockResources = System(
  Query(ChangeTrackers(R.Amount), Mut(Unlock)).filter(With(R.Id)),
)((query) => {
  for (const [trackers, unlock] of query.all()) {
    if (
      trackers.isAddedOrChanged() &&
      trackers.value().value !== 0 &&
      !unlock.unlocked
    ) {
      unlock.unlocked = true;
    }
  }
});

export class UnlocksPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app.addSystem(UnlockResources);
  }
}
