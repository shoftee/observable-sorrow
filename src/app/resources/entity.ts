import { reactive } from "vue";

import { ResourceId } from "@/_interfaces";

import { Entity } from "../ecs";
import { MutationComponent } from "./components";

export class ResourceEntity extends Entity {
  readonly mutations: MutationComponent;

  readonly state: ResourceState;

  constructor(readonly id: ResourceId) {
    super(id);

    this.mutations = this.addComponent(new MutationComponent());
    this.state = reactive(new ResourceState());
  }
}

export class ResourceState {
  unlocked = false;
  amount = 0;
  change = 0;
  capacity?: number;

  get effectiveCapacity(): number {
    return this.capacity ?? Number.POSITIVE_INFINITY;
  }
}
