import { TimeConstants } from "@/app/state";
import { round } from "@/app/utils/mathx";

import { TimeEntity } from "../entity";

import { System } from ".";

export class TimeSystem extends System {
  update(dt: number): void {
    const time = this.admin.time();

    const factor = this.admin.player().state.timeAcceleration;
    time.state.millisPerTick = TimeConstants.MillisPerTick / factor;

    this.progressTimers(time, dt);
  }

  private progressTimers(time: TimeEntity, dt: number) {
    for (const timer of time.timers()) {
      timer.delta = dt / (timer.period * time.state.millisPerTick);
      const last = timer.absolute;
      timer.absolute = round(timer.absolute + timer.delta, 3);
      timer.wholeTicks = Math.floor(timer.absolute) - Math.floor(last);
    }
  }
}
