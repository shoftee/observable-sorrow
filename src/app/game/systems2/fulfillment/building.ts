import { any, cache } from "@/app/utils/collections";

import { EcsPlugin, PluginApp } from "@/app/ecs";
import {
  All,
  ChildrenQuery,
  Commands,
  DiffMut,
  Eager,
  Every,
  MapQuery,
  Query,
  Value,
} from "@/app/ecs/query";
import { System } from "@/app/ecs/system";

import { BuildingMetadataType, Meta, resourceQtyIterable } from "@/app/state";

import {
  Building,
  DeltaRecorder,
  Level,
  PriceRatio,
  Resource,
  Unlocked,
  UnlockOnEffect,
} from "../types";
import * as F from "./types";
import * as R from "../resource/types";

function* buildingComponents(meta: BuildingMetadataType) {
  yield new Building(meta.id);

  yield new Level();
  yield new PriceRatio(meta.prices.ratio);

  // components required for unlock effects
  yield new Unlocked(!meta.unlock);
  if (meta.unlock) {
    if (meta.unlock.priceRatio) {
      yield new F.UnlockOnPriceRatio(meta.unlock.priceRatio);
    }
    if (meta.unlock.unlockEffect) {
      yield new UnlockOnEffect(meta.unlock.unlockEffect);
    }
  }
}

const SpawnBuildings = System(Commands())((cmds) => {
  for (const meta of Meta.buildings()) {
    cmds
      .spawn(...F.fulfillmentComponents(meta.id), ...buildingComponents(meta))
      .entity((e) => {
        for (const [id, requirement] of resourceQtyIterable(meta.prices.base)) {
          cmds.spawnChild(e, ...F.ingredientComponents(id, requirement));
        }
      });
  }
});

export class BuildingSetupPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app.addStartupSystem(SpawnBuildings);
  }
}

const Q_Resource = Value(Resource);
const UnlockBuildingsByResourceQuantity = System(
  Query(
    Value(F.UnlockOnPriceRatio),
    DiffMut(Unlocked),
    Eager(ChildrenQuery(Q_Resource, Value(F.Requirement))),
  ).filter(Every(Building)),
  MapQuery(Q_Resource, All(Value(R.Amount))),
)((buildingsQuery, resourcesQuery) => {
  const resourcesCache = cache(() => resourcesQuery.map());
  for (const [ratio, unlocked, ingredients] of buildingsQuery.all()) {
    if (!unlocked.value) {
      const resources = resourcesCache.retrieve();
      unlocked.value = any(ingredients, ([id, requirement]) => {
        const [amount] = resources.get(id)!;
        return amount >= requirement * ratio;
      });
    }
  }
});

const DeltaRecorders = [
  DeltaRecorder(
    Level,
    Value(Building),
  )((root, { value: level }, [id]) => {
    root.buildings[id].level = level;
  }),
];

export class BuildingResolutionPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app
      .addSystem(UnlockBuildingsByResourceQuantity)
      .addSystems(DeltaRecorders, { stage: "last-start" });
  }
}
