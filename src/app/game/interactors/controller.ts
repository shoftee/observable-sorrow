import { ref, watchSyncEffect } from "vue";

import { IGameController } from "@/app/interfaces";
import { TimeConstants } from "@/app/state";
import { ITimestamp } from "@/app/utils/timestamp";

import { EntityAdmin } from "../entity";
import { round } from "@/app/utils/mathx";

type UpdateFunction = (deltaTime: number) => void;
type RenderFunction = () => void;

export class GameController implements IGameController {
  private lastTimestamp = 0;
  private handle?: number;

  private millisPerTick = TimeConstants.MillisPerTick;
  private slowness = ref(1);

  constructor(
    private readonly admin: EntityAdmin,
    private readonly update: UpdateFunction,
    private readonly render: RenderFunction,
    private readonly timestamp: ITimestamp,
  ) {
    watchSyncEffect(() => {
      const millisPerTick = round(
        this.admin.time().state.millisPerTick / this.slowness.value,
      );

      this.millisPerTick = millisPerTick;
    });
  }

  start(): void {
    this.lastTimestamp = this.timestamp.millis();
    const millisPerUpdate =
      TimeConstants.MillisPerTick / TimeConstants.UpdatesPerTick;
    this.handle = setInterval(() => this.doUpdate(), millisPerUpdate);
  }

  stop(): void {
    clearInterval(this.handle);
  }

  private doUpdate(): void {
    const now = this.timestamp.millis();

    const elapsed = Math.round(now - this.lastTimestamp);
    this.lastTimestamp = now;

    const millisPerTick = this.millisPerTick;
    // allow for multiple ticks per update
    let simulatedMillis = 0;
    while (simulatedMillis < elapsed) {
      const dt = Math.min(millisPerTick, elapsed - simulatedMillis);
      this.update(dt);
      simulatedMillis += dt;
    }

    this.render();

    // rate control
    const updateDuration = Date.now() - now;
    const updateAllowance = millisPerTick * TimeConstants.UpdatesPerTick;
    if (updateDuration > updateAllowance) {
      // update took too long, make ticks less frequent
      this.slowness.value = updateAllowance / updateDuration;
    } else {
      this.slowness.value = 1;
    }
  }
}
