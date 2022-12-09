import { any } from "@/app/utils/collections";

import {
  BuildingMetadataType,
  Meta,
  ResourceMap,
  resourceQtyIterable,
} from "@/app/state";

import { EcsPlugin, PluginApp } from "@/app/ecs";
import {
  Tuple,
  ChangeTrackers,
  ChildrenQuery,
  DiffMut,
  Has,
  MapQuery,
  Query,
  Value,
  Commands,
  EntityMapQuery,
} from "@/app/ecs/query";
import { System } from "@/app/ecs/system";

import { DeltaExtractor } from "../core";
import { ResourceLedger } from "../core/orders";
import { Building, Level, PriceRatio, Resource } from "../types/common";
import { Unlocked, UnlockOnEffect } from "../unlock/types";
import { BuildingEffect, Effect, NumberValue } from "../effects/types";
import * as events from "../types/events";
import * as R from "../resource/types";

import * as F from "./types";
import { BufferedReceiverSystem } from "../types/ecs";

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
      .defer((e) => {
        if (meta.unlock) {
          const { priceRatio: ratio, unlockEffect: effect } = meta.unlock;
          if (ratio) {
            cmds.spawnChild(e, new Unlocked(false), new PriceRatio(ratio));
          }
          if (effect) {
            cmds.spawnChild(e, new Unlocked(false), new UnlockOnEffect(effect));
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

const ProcessConstructBuildingOrders = BufferedReceiverSystem(
  events.ConstructBuildingOrder,
)(
  MapQuery(
    Value(Building),
    Tuple(DiffMut(Level), ChildrenQuery(Value(Resource), Value(F.Requirement))),
  ),
  ResourceLedger(),
)((event, buildings, ledger) => {
  const [level, requirements] = buildings.get(event.building)!;

  ledger.applyOrder(
    {
      credits: new ResourceMap(requirements),
    },
    {
      success() {
        level.value++;
      },
    },
  );
});

const HandleLevelChanged = System(
  EntityMapQuery(Value(Building), ChangeTrackers(Level)),
  EntityMapQuery(
    Value(PriceRatio),
    ChildrenQuery(Value(F.BaseRequirement), DiffMut(F.Requirement)),
  ),
  MapQuery(Value(BuildingEffect), DiffMut(NumberValue)).filter(Has(Effect)),
)((trackersQuery, requirementsQuery, effectsQuery) => {
  for (const [entity, [id, trackers]] of trackersQuery) {
    if (trackers.isAddedOrChanged()) {
      const { value: level } = trackers.value();

      // Update ingredient requirements
      const [ratio, ingredients] = requirementsQuery.get(entity)!;
      for (const [base, requirement] of ingredients) {
        requirement.value = base * Math.pow(ratio, level);
      }

      // Update effect values
      const effectValue = effectsQuery.get(id);
      if (effectValue) {
        effectValue.value = level || undefined;
      }
    }
  }
});

export class BuildingOrderPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app
      .registerEvent(events.ConstructBuildingOrder)
      .addSystems([ProcessConstructBuildingOrders, HandleLevelChanged]);
  }
}

const Q_Resource = Value(Resource);

const ProcessRatioUnlocks = System(
  Query(
    ChildrenQuery(Q_Resource, Value(F.Requirement)),
    ChildrenQuery(DiffMut(Unlocked), Value(PriceRatio)),
  ).filter(Has(Building)),
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

const Extractors = [
  BuildingExtractor(Level, (building, { value: level }) => {
    building.level = level;
  }),
];

export class BuildingResolutionPlugin extends EcsPlugin {
  add(app: PluginApp): void {
    app
      .addSystems([ProcessRatioUnlocks])
      .addSystems(Extractors, { stage: "last-start" });
  }
}
