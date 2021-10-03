import { reactive } from "vue";

import { Entity } from "@/_ecs";
import { BuildingId } from "@/_interfaces";
import {
  BuildingMetadata,
  BuildingMetadataType,
  BuildingState,
} from "@/_state";

export class BuildingEntity extends Entity {
  readonly meta: BuildingMetadataType;
  readonly state: BuildingState;

  manualConstruct: boolean;

  constructor(readonly id: BuildingId) {
    super(id);
    this.meta = BuildingMetadata[id];
    this.state = reactive(new BuildingState(this.id));

    this.manualConstruct = false;
  }
}
