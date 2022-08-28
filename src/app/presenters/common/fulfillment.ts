import { reactive, computed } from "vue";

import { ResourceId } from "@/app/interfaces";
import { Meta, UnitKind } from "@/app/state";
import { StateSchema } from "@/app/game/systems2/core";

import { NumberView } from ".";

export interface FulfillmentItemView {
  ingredients: IngredientItemView[];
  fulfilled: boolean;
  capped: boolean;
}

type FulfillmentSchema = {
  ingredients: Partial<{
    [K in ResourceId]: IngredientSchema;
  }>;
  fulfilled: boolean;
  capped: boolean;
};

export interface IngredientItemView {
  readonly id: ResourceId;
  label: string;
  requirement: number;
  fulfillment: number;
  fulfilled: boolean;
  eta: NumberView | undefined;
  capped: boolean;
}

interface IngredientSchema {
  requirement: number;
  fulfilled: boolean;
  eta: number | undefined;
  capped: boolean;
}

export function fulfillmentView(
  state: StateSchema,
  fulfillment: FulfillmentSchema,
): FulfillmentItemView {
  return reactive({
    ingredients: Array.from(
      Object.entries(fulfillment.ingredients),
      ([key, value]) => ingredientView(state, key as ResourceId, value),
    ),
    fulfilled: fulfillment.fulfilled,
    capped: fulfillment.capped,
  });
}

function ingredientView(
  state: StateSchema,
  id: ResourceId,
  value: IngredientSchema,
) {
  return reactive({
    id: id,
    label: Meta.resource(id).label,
    requirement: computed(() => value.requirement),
    fulfillment: computed(() => state.resources[id].amount),
    fulfilled: computed(() => value.fulfilled),
    eta: computed(() => etaView(value.eta)),
    capped: computed(() => value.capped),
  });
}

function etaView(eta: number | undefined): NumberView | undefined {
  if (eta !== undefined) {
    return {
      value: eta,
      style: { unit: UnitKind.Tick },
      rounded: true,
      showSign: "negative",
    };
  } else {
    return undefined;
  }
}
