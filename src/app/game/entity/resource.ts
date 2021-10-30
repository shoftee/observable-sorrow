import { reactive } from "vue";

import { ResourceId } from "@/app/interfaces";
import { Meta, ResourceMetadataType, ResourceState } from "@/app/state";
import { SaveState } from "@/app/store";

import { Entity, EntityPool, ResourceDelta, Watched, Watcher } from ".";

type ResourceStore = NonNullable<SaveState["resources"]>[ResourceId];

export class ResourceEntity extends Entity<ResourceId> implements Watched {
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

  load(store: ResourceStore): void {
    if (store) {
      this.state.amount = store.amount;
      this.state.unlocked = store.unlocked;
    }
  }

  save(): ResourceStore {
    return {
      amount: this.state.amount,
      unlocked: this.state.unlocked,
    };
  }
}

export class ResourcesPool extends EntityPool<ResourceId, ResourceEntity> {
  constructor(watcher: Watcher) {
    super("resources", watcher);
    for (const meta of Meta.resources()) {
      this.add(new ResourceEntity(meta));
    }
  }

  loadState(save: SaveState): void {
    const resources = save.resources;
    if (resources !== undefined) {
      for (const resource of this.enumerate()) {
        resource.load(resources[resource.id]);
      }
    }
  }

  saveState(save: SaveState): void {
    save.resources = {};
    for (const resource of this.enumerate()) {
      save.resources[resource.id] = resource.save();
    }
  }
}
