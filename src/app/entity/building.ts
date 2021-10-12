import { reactive } from "vue";

import { BuildingId } from "@/_interfaces";
import {
  BuildingMetadata,
  BuildingMetadataType,
  BuildingState,
  Meta,
} from "@/_state";

import { Entity, EntityPool, EntityWatcher, OrderStatus, Watch } from ".";

export class BuildingEntity extends Entity {
  readonly meta: BuildingMetadataType;
  readonly state: BuildingState;

  status: OrderStatus;

  constructor(readonly id: BuildingId) {
    super(id);
    this.meta = BuildingMetadata[id];
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
    for (const { id } of Meta.buildings()) {
      this.add(new BuildingEntity(id));
    }
  }
}
