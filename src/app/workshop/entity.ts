import { Entity, IUpdate } from "../ecs";
import { QueueComponent } from "../ecs/common/queue-component";
import { ResourcePool } from "../resources";
import { RecipeId, RecipeMetadata, RecipeMetadataType } from "./metadata";

export const WorkshopSymbol = Symbol("Workshop");

export interface IWorkshop extends IUpdate {
  order(id: RecipeId): void;
}

export class Workshop extends Entity implements IWorkshop {
  readonly id = "workshop";

  private readonly metadata: Record<RecipeId, RecipeMetadataType>;
  private readonly orders: RecipeOrdersComponent;

  constructor(private resources: ResourcePool) {
    super();
    this.metadata = RecipeMetadata;
    this.orders = this.addComponent(new RecipeOrdersComponent());
  }

  order(id: RecipeId): void {
    this.orders.enqueue(id);
    // todo: use microtask to update immediately?
  }

  update(_deltaTime: number): void {
    this.orders.consume((id) => this.build(id));
  }

  private build(recipeId: RecipeId) {
    // todo: check if enough ingredients first?
    const recipe = this.metadata[recipeId];
    for (const ingredient of recipe.ingredients) {
      const resource = this.resources.get(ingredient.id);
      resource.mutations.credit(ingredient.amount);
    }
    for (const result of recipe.results) {
      const resource = this.resources.get(result.id);
      resource.mutations.debit(result.amount);
    }
  }
}

export class RecipeOrdersComponent extends QueueComponent<RecipeId> {}
