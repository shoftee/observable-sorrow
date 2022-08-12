import { EcsComponent } from "@/app/ecs";

export class Timer extends EcsComponent {
  ticks = 0;
  delta = 0;
  elapsed = 0;

  constructor(readonly period: number) {
    super();
  }

  get isNewTick(): boolean {
    return this.elapsed > 0;
  }
}

export class TimeOptions extends EcsComponent {
  power = 0;
  paused = false;
}
