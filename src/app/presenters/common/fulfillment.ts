import { reactive, computed } from "vue";

import { FulfillmentId, ResourceId } from "@/app/interfaces";
import { Meta, UnitKind } from "@/app/state";
import { StateSchema } from "@/app/game/systems2/core";

import { NumberView } from ".";

export interface IngredientItem {
  readonly id: ResourceId;
  label: string;
  requirement: number;
  fulfillment: number;
  fulfilled: boolean;
  eta: NumberView | undefined;
  capped: boolean;
}

export interface FulfillmentItem {
  ingredients: IngredientItem[];
  fulfilled: boolean;
  capped: boolean;
}

export function fulfillment(
  state: StateSchema,
  id: FulfillmentId,
): FulfillmentItem {
  const fulfillment = state.fulfillments[id];
  return reactive({
    ingredients: Array.from(
      Object.entries(fulfillment.ingredients),
      ([key, value]) => ingredient(state, key as ResourceId, value),
    ),
    fulfilled: fulfillment.fulfilled,
    capped: fulfillment.capped,
  });
}

function ingredient(
  state: StateSchema,
  key: ResourceId,
  value: {
    requirement: number;
    fulfilled: boolean;
    eta: number | undefined;
    capped: boolean;
  },
) {
  const id = key as ResourceId;
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
