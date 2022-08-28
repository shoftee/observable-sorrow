import { BuildingId, TimeIntent } from "@/app/interfaces";
import { ResourceMap } from "@/app/state";

import { EcsEvent } from "@/app/ecs";

export class TimeOptionsChanged extends EcsEvent {
  constructor(readonly intent: TimeIntent) {
    super();
  }
}

export class ResourceOrder extends EcsEvent {
  constructor(readonly debits?: ResourceMap, readonly credits?: ResourceMap) {
    super();
  }
}

export class ConstructBuildingOrder extends EcsEvent {
  constructor(readonly building: BuildingId) {
    super();
  }
}
