import { IngredientState } from "@/app/state";
import { all, any } from "@/app/utils/collections";

import { System } from ".";

export class FulfillmentSystem extends System {
  update(): void {
    for (const { state } of this.admin.fulfillments()) {
      const ingredients = state.ingredients;
      for (const ingredient of ingredients) {
        this.updateIngredient(ingredient);
      }

      state.capped = any(ingredients, (i) => i.capped);
      state.fulfilled = all(ingredients, (i) => i.fulfilled);
    }
  }

  private updateIngredient(ingredient: IngredientState) {
    const resource = this.admin.resource(ingredient.resourceId).state;
    ingredient.fulfillment = resource.amount;

    if (ingredient.fulfillment >= ingredient.requirement) {
      ingredient.fulfilled = true;
      ingredient.fulfillmentTime = undefined;
    } else {
      ingredient.fulfilled = false;
      if (resource.change > 0) {
        if (
          resource.capacity !== undefined &&
          resource.capacity < ingredient.requirement
        ) {
          // requirement won't be fulfilled
          ingredient.fulfillmentTime = Number.POSITIVE_INFINITY;
        } else {
          // calculate remaining time based on change
          const remaining = ingredient.requirement - ingredient.fulfillment;
          ingredient.fulfillmentTime = remaining / resource.change;
        }
      } else {
        // resource is not accumulating
        ingredient.fulfillmentTime = undefined;
      }
    }

    // capped if resource has capacity and requirement is above it
    ingredient.capped =
      resource.capacity !== undefined &&
      ingredient.requirement > resource.capacity;
  }
}
