import { reactive, computed } from "vue";

import { BuildingId, Intent } from "@/app/interfaces";
import { BonfireBuildingId, BonfireItemId, Meta } from "@/app/state";

import {
  FulfillmentItem,
  EffectItem,
  fulfillment,
  numberView,
} from "../common";
import { IStateManager } from "../state-manager";

export function newBonfireItemView(
  id: BonfireItemId,
  manager: IStateManager,
): BonfireItemView {
  switch (id) {
    case "gather-catnip":
      return gatherCatnip();
    case "refine-catnip":
      return refineCatnip(manager);
    default:
      return buyBuilding(id, manager);
  }
}

function gatherCatnip(): BonfireItemView {
  return reactive({
    id: "gather-catnip",
    intent: { kind: "bonfire", id: "gather-catnip" },
    label: "bonfire.gather-catnip.label",
    description: "bonfire.gather-catnip.description",

    unlocked: true,
    fulfillment: {
      capped: false,
      fulfilled: true,
      ingredients: [],
    },
  });
}

function refineCatnip(manager: IStateManager): BonfireItemView {
  return reactive({
    id: "refine-catnip",
    intent: {
      kind: "workshop",
      id: "craft-recipe",
      recipe: "refine-catnip",
    },
    label: "bonfire.refine-catnip.label",
    description: "bonfire.refine-catnip.description",
    flavor: "bonfire.refine-catnip.flavor",

    unlocked: true,
    fulfillment: computed(() => fulfillment("refine-catnip", manager)),
  });
}

function buyBuilding(
  id: BonfireBuildingId,
  manager: IStateManager,
): BonfireItemView {
  const building = Meta.building(id);
  const state = manager.building(building.id);
  return reactive({
    id: id,
    intent: {
      kind: "construction",
      id: "buy-building",
      building: building.id,
    },
    label: building.label,
    description: building.description,
    flavor: building.flavor,

    unlocked: computed(() => state.unlocked),
    level: computed(() => state.level),
    fulfillment: computed(() => fulfillment(building.id, manager)),
    effects: computed(() => effects(building.id, manager)),
  });
}

function effects(buildingId: BuildingId, manager: IStateManager): EffectItem[] {
  const effects = Meta.building(buildingId).effects;
  return Array.from(effects, (meta) =>
    reactive({
      id: meta.id,
      label: meta.label,
      singleAmount: computed(() => numberView(manager, meta.per)),
      totalAmount: computed(() => numberView(manager, meta.total)),
    }),
  );
}

export interface BonfireItemView {
  id: BonfireItemId;
  intent: Intent;

  label: string;
  description: string;
  flavor?: string;

  unlocked: boolean;
  level?: number;

  fulfillment: FulfillmentItem;
  effects?: EffectItem[];
}
