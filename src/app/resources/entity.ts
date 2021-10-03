import { reactive } from "vue";

import { Entity } from "@/_ecs";
import { ResourceId } from "@/_interfaces";
import {
  ResourceMetadata,
  ResourceMetadataType,
  ResourceState,
} from "@/_state";

import { ResourceDelta } from "./state";

export class ResourceEntity extends Entity {
  readonly meta: ResourceMetadataType;
  readonly state: ResourceState;
  readonly delta: ResourceDelta = new ResourceDelta();

  constructor(readonly id: ResourceId) {
    super(id);
    this.meta = ResourceMetadata[id];
    this.state = reactive(new ResourceState());
  }
}
