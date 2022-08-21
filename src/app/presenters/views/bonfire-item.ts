import { reactive, computed } from "vue";

import { BuildingId, Intent } from "@/app/interfaces";
import { BonfireBuildingId, BonfireItemId, Meta } from "@/app/state";

import {
  FulfillmentItemView,
  EffectItem,
  fulfillmentView,
  numberView,
} from "../common";
import { IStateManager } from "../state-manager";
import { StateSchema } from "@/app/game/systems2/core";

export interface BonfireItemView {
  id: BonfireItemId;
  intent: Intent;

  label: string;
  description: string;
  flavor?: string;

  unlocked: boolean;
  level?: number;

  fulfillment: FulfillmentItemView;
  effects?: EffectItem[];
}

export function newBonfireItemView(
  manager: IStateManager,
  id: BonfireItemId,
): BonfireItemView {
  switch (id) {
    case "gather-catnip":
      return gatherCatnip();
    case "refine-catnip":
      return refineCatnip(manager.state);
    default:
      return buyBuilding(manager, id);
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

function refineCatnip(state: StateSchema): BonfireItemView {
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
    fulfillment: computed(() =>
      fulfillmentView(state, state.fulfillments["refine-catnip"]),
    ),
  });
}

function buyBuilding(
  manager: IStateManager,
  id: BonfireBuildingId,
): BonfireItemView {
  const meta = Meta.building(id);
  const fulfillment = manager.state.fulfillments[id];
  const building = manager.state.buildings[id];
  return reactive({
    id: id,
    intent: {
      kind: "construction",
      id: "buy-building",
      building: meta.id,
    },
    label: meta.label,
    description: meta.description,
    flavor: meta.flavor,

    unlocked: computed(() => fulfillment.unlocked),
    level: computed(() => building.level),
    fulfillment: computed(() => fulfillmentView(manager.state, fulfillment)),
    effects: computed(() => effectViews(manager, meta.id)),
  });
}

function effectViews(
  manager: IStateManager,
  buildingId: BuildingId,
): EffectItem[] {
  // TODO: Fix effects.
  return [];

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
