import { reactive } from "vue";

import { ResourceId } from "@/_interfaces";
import { Meta, ResourceMetadataType, ResourceState } from "@/_state";

import { Entity, EntityPool, ResourceDelta, Watcher } from ".";

export class ResourceEntity extends Entity<ResourceId> {
  readonly state: ResourceState;
  readonly delta: ResourceDelta = new ResourceDelta();

  constructor(readonly meta: ResourceMetadataType) {
    super(meta.id);
    this.state = reactive(new ResourceState());
  }

  watch(watcher: Watcher): void {
    watcher.watch(this.id, this.state);
  }
}

export class ResourcesPool extends EntityPool<ResourceId, ResourceEntity> {
  constructor(watcher: Watcher) {
    super("resources", watcher);
    for (const meta of Meta.resources()) {
      this.add(new ResourceEntity(meta));
    }
  }
}
