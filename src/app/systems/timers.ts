import { round } from "@/_utils/mathx";

import { TimeConstants } from "../constants";
import { Timer } from "../entity";

import { System } from ".";

export class TimeSystem extends System {
  update(dt: number): void {
    const time = this.admin.time();
    for (const timer of time.timers()) {
      this.progress(timer, dt);
    }
  }

  private progress(timer: Timer, dt: number): void {
    timer.delta = (TimeConstants.TicksPerMillisecond / timer.period) * dt;
    const last = timer.absolute;
    timer.absolute = round(timer.absolute + timer.delta, 3);
    timer.wholeTicks = Math.floor(timer.absolute) - Math.floor(last);
  }
}
