import { EcsEvent } from "@/app/ecs";
import { TimeIntent } from "@/app/interfaces";
import { ResourceMap } from "@/app/state";

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
