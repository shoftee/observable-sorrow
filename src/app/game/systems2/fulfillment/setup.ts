import { EcsPlugin, PluginApp } from "@/app/ecs";
import { Commands } from "@/app/ecs/query";
import { System } from "@/app/ecs/system";
import { ResourceId } from "@/app/interfaces";

import { BuildingMetadataType, Meta, resourceQtyIterable } from "@/app/state";
import { PriceRatio, Unlocked, UnlockOnEffect } from "../types";

import * as F from "./types";

function* ingredientComponents(id: ResourceId, requirement: number) {
  yield new F.Resource(id);
  yield new F.Requirement(requirement);
  yield new F.Fulfillment();
  yield new F.Capped(false);
}

const SpawnFulfillments = System(Commands())((cmds) => {
  for (const meta of Meta.recipes()) {
    cmds
      .spawn(new F.Recipe(meta.id), new F.Fulfillment(), new F.Capped(false))
      .entity((e) => {
        for (const [id, requirement] of resourceQtyIterable(meta.ingredients)) {
          cmds.spawnChild(e, ...ingredientComponents(id, requirement));
        }
      });
  }
});

function* buildingComponents(meta: BuildingMetadataType) {
  yield new F.Building(meta.id);
  yield new F.Fulfillment();
  yield new F.Capped(false);

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
    cmds
      .spawn(...buildingComponents(meta), new PriceRatio(meta.prices.ratio))
      .entity((e) => {
        for (const [id, requirement] of resourceQtyIterable(meta.prices.base)) {
          cmds.spawnChild(e, ...ingredientComponents(id, requirement));
        }
      });
  }
});

export class FulfillmentSetupPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app.addStartupSystem(SpawnFulfillments).addStartupSystem(SpawnBuildings);
  }
}
