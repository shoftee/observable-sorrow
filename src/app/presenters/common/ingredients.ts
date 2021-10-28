import { reactive, computed } from "vue";

import { ResourceId } from "@/app/interfaces";
import { IngredientState, Meta, UnitKind } from "@/app/state";

import { NumberView } from "..";

export interface IngredientItem {
  readonly id: ResourceId;
  label: string;
  requirement: number;
  fulfillment: number;
  fulfilled: boolean;
  fulfillmentTime?: NumberView | undefined;
  capped: boolean;
}

export function fromIngredients(
  ingredients: IngredientState[],
): IngredientItem[] {
  return Array.from(ingredients, (state) =>
    reactive({
      id: state.resourceId,
      label: Meta.resource(state.resourceId).label,
      requirement: computed(() => state.requirement),
      fulfillment: computed(() => state.fulfillment),
      fulfilled: computed(() => state.fulfilled),
      fulfillmentTime: computed(() => fulfillmentTime(state)),
      capped: computed(() => state.capped),
    }),
  );
}

function fulfillmentTime(ingredient: IngredientState): NumberView | undefined {
  if (ingredient.fulfillmentTime === undefined) {
    return undefined;
  } else {
    return {
      value: ingredient.fulfillmentTime,
      style: { unit: UnitKind.Tick, invert: false },
      rounded: true,
      showSign: "negative",
    };
  }
}
