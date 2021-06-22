import { Entity, IUpdate } from "../ecs";
import { QueueComponent } from "../ecs/common/queue-component";
import { ResourcePool } from "../resources";
import {
  WorkshopRecipeId,
  WorkshopRecipeMetadata,
} from "../core/metadata/crafting";

export const WorkshopSymbol = Symbol("Workshop");

export interface IWorkshop extends IUpdate {
  order(id: WorkshopRecipeId): void;
}

export class Workshop extends Entity implements IWorkshop {
  private readonly orders: RecipeOrdersComponent;

  constructor(private readonly resources: ResourcePool) {
    super();
    this.orders = this.addComponent(new RecipeOrdersComponent());
  }

  order(id: WorkshopRecipeId): void {
    this.orders.enqueue(id);
    // todo: use microtask to update immediately?
  }

  update(_dt: number): void {
    this.orders.consume((id) => this.build(id));
  }

  private build(recipeId: WorkshopRecipeId) {
    // todo: check if enough ingredients first?
    const recipe = WorkshopRecipeMetadata[recipeId];
    for (const ingredient of recipe.ingredients) {
      const resource = this.resources.get(ingredient.id);
      resource.mutations.credit(ingredient.amount);
    }
    for (const result of recipe.products) {
      const resource = this.resources.get(result.id);
      resource.mutations.debit(result.amount);
    }
  }
}

export class RecipeOrdersComponent extends QueueComponent<WorkshopRecipeId> {}
