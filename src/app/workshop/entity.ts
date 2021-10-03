import { reactive } from "vue";

import { Entity } from "@/_ecs";
import { RecipeId } from "@/_interfaces";
import { RecipeState } from "@/_state";

export class RecipeEntity extends Entity {
  readonly state: RecipeState;

  manualCraft: boolean;

  constructor(readonly id: RecipeId) {
    super(id);
    this.manualCraft = false;
    this.state = reactive(new RecipeState(id));
  }
}
