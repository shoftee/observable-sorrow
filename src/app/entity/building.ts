import { reactive } from "vue";

import { Entity } from "@/_ecs";
import { BuildingId } from "@/_interfaces";
import {
  BuildingMetadata,
  BuildingMetadataType,
  BuildingState,
} from "@/_state";
import { OrderStatus } from ".";

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
}
