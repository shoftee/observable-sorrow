import { round } from "../../utils/mathx";

import { TimeConstants } from "../../constants";
import { Component } from "..";

export class TimerComponent extends Component {
  /** Fractional ticks (0.001 precision) */
  absolute = 0;

  /** Fractional ticks since last update */
  delta = 0;

  /** How many whole ticks passed since last delta */
  wholeTicks = 0;

  /** How many game ticks it takes to progress the timer */
  period = 1;

  constructor(period = 1) {
    super();
    this.period = period;
  }

  update(dt: number): void {
    this.delta = (TimeConstants.TicksPerMillisecond / this.period) * dt;
    const last = this.absolute;
    this.absolute = round(this.absolute + this.delta, 3);
    this.wholeTicks = Math.floor(this.absolute) - Math.floor(last);
  }
}
