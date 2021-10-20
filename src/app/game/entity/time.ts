import { reactive } from "vue";

import { TimeConstants, TimeState } from "@/app/state";

import { Entity, Watcher } from ".";

export class TimeEntity extends Entity<"time"> {
  readonly state: TimeState;

  readonly ticks: Timer;
  readonly days: Timer;

  constructor() {
    super("time");

    this.state = reactive({
      millisPerTick: TimeConstants.MillisPerTick,
    });

    this.ticks = new Timer(1);
    this.days = new Timer(TimeConstants.TicksPerDay);
  }

  watch(watcher: Watcher): void {
    watcher.watch(this.id, this.state);
  }

  *timers(): Iterable<Timer> {
    yield this.ticks;
    yield this.days;
  }
}

export class Timer {
  /** Fractional ticks (0.001 precision) */
  absolute = 0;

  /** Fractional ticks since last update */
  delta = 0;

  /** How many whole ticks passed since last delta */
  wholeTicks = 0;

  /** How many game ticks it takes to progress the timer */
  period = 1;

  constructor(period = 1) {
    this.period = period;
  }
}
