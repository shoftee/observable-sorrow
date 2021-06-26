import { round } from "../../utils/mathx";

import { TimeConstants } from "../../constants";
import { Component } from "..";

export class TimerComponent extends Component {
  /** Fractional ticks (0.001 precision) */
  tick = 0;

  /** Fractional ticks since last update */
  delta = 0;

  /** Whether the last update ticked the timer */
  ticked = false;

  /** How many game ticks it takes to progress the timer */
  period = 1;

  constructor(period = 1) {
    super();
    this.period = period;
  }

  update(dt: number): void {
    this.delta = (TimeConstants.TicksPerMillisecond * dt) / this.period;
    const last = this.tick;
    this.tick = round(this.tick + this.delta, 3);
    this.ticked = Math.floor(last) < Math.floor(this.tick);
  }
}
