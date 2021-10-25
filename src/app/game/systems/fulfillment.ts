import { IngredientState } from "@/app/state";
import { all, any } from "@/app/utils/collections";

import { System } from ".";

type Fulfillment = {
  ingredients: IngredientState[];
  fulfilled: boolean;
  capped: boolean;
};

export class FulfillmentSystem extends System {
  update(): void {
    for (const fulfillment of this.fulfillments()) {
      const ingredients = fulfillment.ingredients;
      for (const ingredient of ingredients) {
        this.updateIngredient(ingredient);
      }

      fulfillment.capped = any(ingredients, (i) => i.capped);
      fulfillment.fulfilled = all(ingredients, (i) => i.fulfilled);
    }
  }

  private *fulfillments(): Iterable<Fulfillment> {
    for (const recipe of this.admin.recipes()) {
      yield recipe.state;
    }
    for (const building of this.admin.buildings()) {
      yield building.state;
    }
    for (const tech of this.admin.techs()) {
      yield tech.state;
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
