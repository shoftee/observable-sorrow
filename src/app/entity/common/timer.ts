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
