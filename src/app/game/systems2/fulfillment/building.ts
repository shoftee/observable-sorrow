import { cache } from "@/app/utils/cache";
import { any } from "@/app/utils/collections";

import { EcsPlugin, PluginApp } from "@/app/ecs";
import {
  All,
  ChangeTrackers,
  ChildrenQuery,
  DiffMut,
  Eager,
  Every,
  MapQuery,
  Query,
  Receive,
  Value,
  Commands,
} from "@/app/ecs/query";
import { System } from "@/app/ecs/system";

import {
  BuildingMetadataType,
  Ledger,
  Meta,
  ResourceMap,
  resourceQtyIterable,
} from "@/app/state";

import { DeltaExtractor } from "../core/renderer";
import { applyOrder, ResourceMapQuery } from "../core/orders";
import {
  Building,
  Level,
  PriceRatio,
  Unlocked,
  BooleanEffect,
  Resource,
} from "../types/common";

import * as events from "../types/events";
import * as F from "./types";
import * as R from "../resource/types";

function* buildingComponents(meta: BuildingMetadataType) {
  yield new Building(meta.id);
  yield new Level();
  yield new PriceRatio(meta.prices.ratio);
  yield new Unlocked(!meta.unlock);
}

const SpawnBuildings = System(Commands())((cmds) => {
  for (const meta of Meta.buildings()) {
    cmds
      .spawn(...F.fulfillmentComponents(meta.id), ...buildingComponents(meta))
      .entity((e) => {
        if (meta.unlock) {
          const { priceRatio: ratio, unlockEffect: effect } = meta.unlock;
          if (ratio) {
            cmds.spawnChild(e, new Unlocked(false), new PriceRatio(ratio));
          }
          if (effect) {
            cmds.spawnChild(e, new Unlocked(false), new BooleanEffect(effect));
          }
        }
        for (const [id, requirement] of resourceQtyIterable(meta.prices.base)) {
          cmds.spawnChild(
            e,
            ...F.ingredientComponents(id, requirement),
            new F.BaseRequirement(requirement),
          );
        }
      });
  }
});

export class BuildingSetupPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app.addStartupSystem(SpawnBuildings);
  }
}

const ProcessConstructBuildingOrders = System(
  Receive(events.ConstructBuildingOrder),
  MapQuery(
    Value(Building),
    All(DiffMut(Level), ChildrenQuery(Value(Resource), Value(F.Requirement))),
  ),
  ResourceMapQuery,
)((orders, buildings, resources) => {
  const ambientCache = cache(() => {
    // Initialize the ambient deltas.
    const ambient = new Ledger();
    for (const [id, [, , entry]] of resources) {
      ambient.add(id, entry);
    }
    return ambient;
  });

  for (const order of orders.pull()) {
    const ambient = ambientCache.retrieve();

    const [level, requirements] = buildings.get(order.building)!;
    applyOrder(
      {
        credits: new ResourceMap(requirements),
      },
      ambient,
      resources,
      {
        success() {
          level.value++;
        },
      },
    );
  }
});

const CalculateBuildingRequirements = System(
  Query(
    ChangeTrackers(Level),
    Value(PriceRatio),
    ChildrenQuery(Value(F.BaseRequirement), DiffMut(F.Requirement)),
  ),
)((query) => {
  for (const [trackers, ratio, ingredients] of query) {
    if (trackers.isAddedOrChanged()) {
      const { value: level } = trackers.value();
      for (const [base, requirement] of ingredients) {
        requirement.value = base * Math.pow(ratio, level);
      }
    }
  }
});

export class BuildingOrderPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app
      .registerEvent(events.ConstructBuildingOrder)
      .addSystems([
        ProcessConstructBuildingOrders,
        CalculateBuildingRequirements,
      ]);
  }
}

const Q_Resource = Value(Resource);

const ProcessRatioUnlocks = System(
  Query(
    Eager(ChildrenQuery(Q_Resource, Value(F.Requirement))),
    ChildrenQuery(DiffMut(Unlocked), Value(PriceRatio)),
  ).filter(Every(Building)),
  MapQuery(Q_Resource, Value(R.Amount)),
)((buildings, amounts) => {
  for (const [ingredients, unlocks] of buildings) {
    for (const [unlocked, ratio] of unlocks) {
      if (!unlocked.value) {
        unlocked.value = any(ingredients, ([id, requirement]) => {
          const amount = amounts.get(id)!;
          return amount >= requirement * ratio;
        });
      }
    }
  }
});

const BuildingExtractor = DeltaExtractor(Value(Building))(
  (schema, [id]) => schema.buildings[id],
);

const DeltaExtractors = [
  BuildingExtractor(Level, (building, { value: level }) => {
    building.level = level;
  }),
];

export class BuildingResolutionPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app
      .addSystems([ProcessRatioUnlocks])
      .addSystems(DeltaExtractors, { stage: "last-start" });
  }
}
