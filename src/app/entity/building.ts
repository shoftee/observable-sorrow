import { reactive } from "vue";

import { BuildingId } from "@/_interfaces";
import { BuildingMetadataType, BuildingState, Meta } from "@/_state";

import { Entity, EntityPool, EntityWatcher, OrderStatus, Watch } from ".";

export class BuildingEntity extends Entity<BuildingId> {
  readonly state: BuildingState;

  status: OrderStatus;

  constructor(readonly meta: BuildingMetadataType) {
    super(meta.id);
    this.state = reactive(new BuildingState(this.id));
    this.status = OrderStatus.EMPTY;
  }

  acceptWatcher(watcher: Watch): void {
    watcher(this.id, this.state);
  }
}

export class BuildingsPool extends EntityPool<BuildingId, BuildingEntity> {
  constructor(watcher: EntityWatcher) {
    super("buildings", watcher);
    for (const meta of Meta.buildings()) {
      this.add(new BuildingEntity(meta));
    }
  }
}
