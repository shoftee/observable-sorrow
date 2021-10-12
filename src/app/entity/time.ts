import { Entity } from ".";

import { CalendarConstants } from "../constants/calendar";

export class TimeEntity extends Entity<"time"> {
  readonly ticks: Timer;
  readonly days: Timer;

  constructor() {
    super("time");

    this.ticks = new Timer(1);
    this.days = new Timer(CalendarConstants.TicksPerDay);
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
