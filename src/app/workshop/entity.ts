import { Entity } from "../ecs";
import { RawQueueComponent } from "../ecs/common";

import { WorkshopRecipeId } from "../core/metadata";

import { EntityAdmin } from "../game/entity-admin";

export class WorkshopEntity extends Entity {
  readonly orders: RecipeOrdersComponent;

  constructor(admin: EntityAdmin) {
    super(admin, "workshop");
    this.orders = this.addComponent(new RecipeOrdersComponent());
  }
}

export class RecipeOrdersComponent extends RawQueueComponent<WorkshopRecipeId> {}
