import { reactive } from "vue";

import { ResourceId } from "@/_interfaces";
import {
  Meta,
  ResourceDelta,
  ResourceMetadataType,
  ResourceState,
} from "@/_state";

import { Entity, EntityPool, EntityWatcher, Watch } from ".";

export class ResourceEntity extends Entity<ResourceId> {
  readonly state: ResourceState;
  readonly delta: ResourceDelta = new ResourceDelta();

  constructor(readonly meta: ResourceMetadataType) {
    super(meta.id);
    this.state = reactive(new ResourceState());
  }

  acceptWatcher(watcher: Watch): void {
    watcher(this.id, this.state);
  }
}

export class ResourcesPool extends EntityPool<ResourceId, ResourceEntity> {
  constructor(watcher: EntityWatcher) {
    super("resources", watcher);
    for (const meta of Meta.resources()) {
      this.add(new ResourceEntity(meta));
    }
  }
}
