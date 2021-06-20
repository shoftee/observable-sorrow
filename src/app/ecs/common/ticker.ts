import { TimeConstants } from "../../constants";
import { Component } from "..";
import mathx from "../../utils/mathx";

export class TickerComponent extends Component {
  /** Fractional ticks (0.001 precision) */
  tick = 0;

  /** Fractional ticks since last update */
  delta = 0;

  /** Whether the last update ticked the ticker */
  ticked = false;

  /** How many game ticks it takes to tick the ticker */
  every = 1;

  constructor(every = 1) {
    super();
    this.every = every;
  }

  update(deltaTime: number): void {
    this.delta = (TimeConstants.TicksPerMillisecond * deltaTime) / this.every;
    const last = this.tick;
    this.tick = mathx.round(this.tick + this.delta, 3);
    this.ticked = Math.floor(last) < Math.floor(this.tick);
  }
}
