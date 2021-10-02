import { reactive } from "vue";

import { ResourceId } from "@/_interfaces";
import { ResourceState } from "@/_state";

import { Entity, MutationComponent } from "@/app/ecs";

export class ResourceEntity extends Entity {
  readonly mutations: MutationComponent;

  readonly state: ResourceState;

  constructor(readonly id: ResourceId) {
    super(id);

    this.mutations = this.addComponent(new MutationComponent());
    this.state = reactive(new ResourceState());
  }
}
