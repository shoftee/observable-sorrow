import { reactive, computed } from "vue";

import { BuildingId, Intent } from "@/app/interfaces";
import { BonfireBuildingId, BonfireItemId, Meta } from "@/app/state";

import { StateSchema } from "@/app/game/systems2/core";

import {
  FulfillmentItemView,
  EffectItem,
  fulfillmentView,
  numberView,
} from "../common";

import { fromIds } from "./array";

export function allBonfireItemViews(schema: StateSchema) {
  return fromIds(schema, Meta.bonfireItems(), newBonfireItemView);
}

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
  schema: StateSchema,
  id: BonfireItemId,
): BonfireItemView {
  switch (id) {
    case "gather-catnip":
      return gatherCatnip();
    case "refine-catnip":
      return refineCatnip(schema);
    default:
      return buyBuilding(schema, id);
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
  state: StateSchema,
  id: BonfireBuildingId,
): BonfireItemView {
  const meta = Meta.building(id);
  const fulfillment = state.fulfillments[id];
  const building = state.buildings[id];
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
    fulfillment: computed(() => fulfillmentView(state, fulfillment)),
    effects: computed(() => effectViews(state, meta.id)),
  });
}

function effectViews(state: StateSchema, buildingId: BuildingId): EffectItem[] {
  const effects = Meta.building(buildingId).effects;
  return Array.from(effects, (meta) =>
    reactive({
      id: meta.id,
      label: meta.label,
      singleAmount: computed(() => numberView(state, meta.per)),
      totalAmount: computed(() => numberView(state, meta.total)),
    }),
  );
}
