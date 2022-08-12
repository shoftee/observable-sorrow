import { EcsEvent } from "@/app/ecs";
import { TimeIntent } from "@/app/interfaces";

export class TimeEvent extends EcsEvent {
  constructor(readonly intent: TimeIntent) {
    super();
  }
}
