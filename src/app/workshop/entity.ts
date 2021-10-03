import { RecipeId } from "@/_interfaces";
import { Entity } from "@/app/ecs";
import { reactive } from "vue";
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
