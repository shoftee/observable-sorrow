import { WorkshopRecipeId } from "@/_interfaces";
import { WorkshopRecipeMetadata } from "@/_state";

import { System } from "../ecs";
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
    for (const [id, amount] of recipe.ingredients) {
      const resource = this.admin.resource(id);
      resource.mutations.take(amount);
    }
    for (const [id, amount] of recipe.products.entries()) {
      const resource = this.admin.resource(id);
      resource.mutations.give(amount);
    }
  }
}
