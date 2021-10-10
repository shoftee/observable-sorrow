import { reactive } from "vue";

import { Entity } from "@/_ecs";
import { PopulationState } from "@/_state/population";

export class PopulationEntity extends Entity {
  readonly state: PopulationState;

  constructor() {
    super("population");

    this.state = reactive(new PopulationState());
  }
}
