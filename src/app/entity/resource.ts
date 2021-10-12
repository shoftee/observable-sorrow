import { reactive } from "vue";

import { ResourceId } from "@/_interfaces";
import {
  ResourceDelta,
  ResourceMetadata,
  ResourceMetadataType,
  ResourceState,
} from "@/_state";

import { Entity } from ".";

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
