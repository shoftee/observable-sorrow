import { reactive } from "@vue/runtime-core";

import { BuildingId } from "@/_interfaces";
import { BuildingState } from "@/_state";
import { Entity } from "../ecs";
import { BuildQueueComponent } from "./components";

export class BuildingEntity extends Entity {
  readonly buildQueue: BuildQueueComponent;

  readonly state: BuildingState;

  constructor(readonly id: BuildingId) {
    super(id);
    this.buildQueue = this.addComponent(new BuildQueueComponent());

    this.state = reactive(new BuildingState(this.id));
  }
}
