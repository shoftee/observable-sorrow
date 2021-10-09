import { reactive } from "vue";

import { Entity } from "@/_ecs";
import { RecipeId } from "@/_interfaces";
import { RecipeState } from "@/_state";

import { OrderStatus } from ".";

export class RecipeEntity extends Entity {
  readonly state: RecipeState;

  status: OrderStatus;

  constructor(readonly id: RecipeId) {
    super(id);
    this.state = reactive(new RecipeState(id));

    this.status = OrderStatus.EMPTY;
  }
}
