import { WorkshopRecipeId } from "@/_interfaces";
import { Entity, RawQueueComponent } from "@/app/ecs";

export class WorkshopEntity extends Entity {
  readonly orders: RecipeOrdersComponent;

  constructor() {
    super("workshop");
    this.orders = this.addComponent(new RecipeOrdersComponent());
  }
}

export class RecipeOrdersComponent extends RawQueueComponent<WorkshopRecipeId> {}
