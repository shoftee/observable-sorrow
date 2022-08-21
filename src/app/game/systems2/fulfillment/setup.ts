import { EcsPlugin, PluginApp } from "@/app/ecs";
import { Commands } from "@/app/ecs/query";
import { System } from "@/app/ecs/system";

import { ResourceId } from "@/app/interfaces";
import { BuildingMetadataType, Meta } from "@/app/state";
import { PriceRatio, Unlocked, UnlockOnEffect } from "../types";

import * as F from "./types";

const SpawnFulfillments = System(Commands())((cmds) => {
  for (const meta of Meta.recipes()) {
    cmds
      .spawn(new F.Recipe(meta.id), new F.Fulfillment(), new F.Capped(false))
      .entity((parent) => {
        for (const [id, requirement] of Object.entries(meta.ingredients)) {
          cmds.spawnChild(
            parent,
            new F.Resource(id as ResourceId),
            new F.Fulfillment(),
            new F.Capped(false),
            new F.Requirement(requirement),
          );
        }
      });
  }
});

function* buildingComponents(meta: BuildingMetadataType) {
  yield new F.Building(meta.id);
  if (meta.unlock) {
    yield new Unlocked(false);
    if (meta.unlock.priceRatio) {
      yield new F.UnlockOnPriceRatio(meta.unlock.priceRatio);
    }
    if (meta.unlock.unlockEffect) {
      yield new UnlockOnEffect(meta.unlock.unlockEffect);
    }
  } else {
    yield new Unlocked(true);
  }
}

const SpawnBuildings = System(Commands())((cmds) => {
  for (const meta of Meta.buildings()) {
    cmds.spawn(...buildingComponents(meta)).entity((parent) => {
      for (const [id, requirement] of Object.entries(meta.prices.base)) {
        cmds.spawnChild(
          parent,
          new F.Resource(id as ResourceId),
          new F.Fulfillment(),
          new F.Capped(false),
          new F.Requirement(requirement),
          new PriceRatio(meta.prices.ratio),
        );
      }
    });
  }
});

export class FulfillmentSetupPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app.addStartupSystem(SpawnFulfillments).addStartupSystem(SpawnBuildings);
  }
}
