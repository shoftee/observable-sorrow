import { reactive } from "vue";

import { ResourceId } from "@/app/interfaces";
import { Meta, ResourceMetadataType, ResourceState } from "@/app/state";

import { Entity, EntityPool, ResourceDelta, Watcher } from ".";

export class ResourceEntity extends Entity<ResourceId> {
  readonly state: ResourceState;
  readonly delta: ResourceDelta = new ResourceDelta();

  constructor(readonly meta: ResourceMetadataType) {
    super(meta.id);
    this.state = reactive({
      unlocked: false,
      amount: 0,
      change: 0,
      capacity: undefined,
    });
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
