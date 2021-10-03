import { reactive } from "vue";

import { Entity } from "@/_ecs";
import { EnvironmentState } from "@/_state";

export class EnvironmentEntity extends Entity {
  readonly state: EnvironmentState;

  constructor() {
    super("environment");

    this.state = reactive(new EnvironmentState());
  }
}
