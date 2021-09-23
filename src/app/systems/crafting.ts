import { System } from "../ecs";

import { WorkshopRecipeId, WorkshopRecipeMetadata } from "../core/metadata";
import { EntityAdmin } from "../game/entity-admin";

export class CraftingSystem extends System {
  constructor(admin: EntityAdmin) {
    super(admin);
  }

  update(): void {
    this.admin.workshop().orders.consume((id) => this.build(id));
  }

  private build(recipeId: WorkshopRecipeId) {
    // todo: check if enough ingredients first?
    const recipe = WorkshopRecipeMetadata[recipeId];
    for (const ingredient of recipe.ingredients) {
      const resource = this.admin.resource(ingredient.id);
      resource.mutations.take(ingredient.amount);
    }
    for (const result of recipe.products) {
      const resource = this.admin.resource(result.id);
      resource.mutations.give(result.amount);
    }
  }
}
