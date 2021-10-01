import { reactive } from "vue";

import { EnvironmentState } from "@/_state";
import { Entity } from "../ecs";

export class EnvironmentEntity extends Entity {
  readonly state: EnvironmentState;

  constructor() {
    super("environment");

    this.state = reactive(new EnvironmentState());
  }
}
