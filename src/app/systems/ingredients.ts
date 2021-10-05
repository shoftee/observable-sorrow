import { IngredientState } from "@/_state";
import { all, any } from "@/_utils/collections";

import { System } from ".";

export class IngredientsSystem extends System {
  update(): void {
    this.updateRecipeIngredients();
    this.updateBuildingIngredients();
  }

  private updateRecipeIngredients() {
    for (const recipe of this.admin.recipes()) {
      const ingredients = recipe.state.ingredients;
      for (const ingredient of ingredients) {
        this.updateIngredient(ingredient);
      }

      recipe.state.capped = any(ingredients.values(), (i) => i.capped);
      recipe.state.fulfilled = all(ingredients.values(), (i) => i.fulfilled);
    }
  }

  private updateBuildingIngredients() {
    for (const building of this.admin.buildings()) {
      const ingredients = building.state.ingredients;
      for (const ingredient of ingredients) {
        this.updateIngredient(ingredient);
      }

      building.state.capped = any(ingredients.values(), (i) => i.capped);
      building.state.fulfilled = all(ingredients.values(), (i) => i.fulfilled);
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
        const remaining = ingredient.requirement - ingredient.fulfillment;
        ingredient.fulfillmentTime = remaining / resource.change;
      }
    }

    ingredient.capped =
      !resource.capacity || ingredient.requirement > resource.capacity;
  }
}
