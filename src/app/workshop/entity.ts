import { Entity } from "../ecs";
import { WorkshopRecipeId } from "../core/metadata/crafting";
import { EntityAdmin } from "../game/entity-admin";
import { RawQueueComponent } from "../ecs/common";

export class WorkshopEntity extends Entity {
  orders!: RecipeOrdersComponent;

  constructor(admin: EntityAdmin) {
    super(admin, "workshop");
  }

  init(): void {
    this.orders = this.addComponent(new RecipeOrdersComponent());
  }
}

export class RecipeOrdersComponent extends RawQueueComponent<WorkshopRecipeId> {}
