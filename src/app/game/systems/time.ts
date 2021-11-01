import { watchSyncEffect } from "vue";

import { TimeConstants } from "@/app/state";
import { round } from "@/app/utils/mathx";

import { System } from ".";

export class TimeSystem extends System {
  init(): void {
    watchSyncEffect(() => {
      const factor = this.admin.player().state.timeAcceleration;
      this.admin.time().state.millisPerTick =
        TimeConstants.MillisPerTick / Math.pow(10, factor);
    });
  }

  update(dt: number): void {
    const time = this.admin.time();

    const millisPerTick = time.state.millisPerTick;
    for (const timer of time.timers()) {
      timer.delta = dt / (timer.period * millisPerTick);

      const lastAbsolute = timer.absolute;
      timer.absolute = round(timer.absolute + timer.delta, 3);

      timer.wholeTicks = Math.floor(timer.absolute) - Math.floor(lastAbsolute);
    }
  }
}
