import { TimeConstants } from "@/app/state";

import { EcsComponent } from "@/app/ecs";

export class TickTimer extends EcsComponent {}

export class Timer extends EcsComponent {
  /** Absolute time, adjusted to the timer's period. */
  ticks = 0;

  /** Fractional periods that passed during the last system delta. */
  delta = 0;

  /** The number of whole period boundaries that were crossed during the last system delta. */
  elapsed = 0;

  constructor(readonly period: number) {
    super();
  }

  /** Equivalent to `elapsed > 0`. */
  get isNewTick(): boolean {
    return this.elapsed > 0;
  }
}

export class TimeControls extends EcsComponent {
  power = 0;
  paused = false;
  millisPerTick = TimeConstants.MillisPerTick;

  get speed() {
    return Math.pow(10, this.power);
  }
}
