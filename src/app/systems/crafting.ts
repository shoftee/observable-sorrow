import { System } from "../ecs";

import { WorkshopRecipeId, WorkshopRecipeMetadata } from "../core/metadata";
import { EntityAdmin } from "../game/entity-admin";

export interface ICraftingSystem {
  order(id: WorkshopRecipeId): void;
}

export class CraftingSystem extends System implements ICraftingSystem {
  constructor(admin: EntityAdmin) {
    super(admin);
  }

  order(id: WorkshopRecipeId): void {
    this.admin.workshop().orders.enqueue(id);
  }

  update(_dt: number): void {
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
