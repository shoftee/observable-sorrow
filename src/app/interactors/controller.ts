import { ITimestamp } from "@/_utils/timestamp";

import { IGameController } from "../game/endpoint";
import { EntityAdmin } from "../entity";

type UpdateFunction = (deltaTime: number) => void;

export class GameController implements IGameController {
  private lastTimestamp = 0;
  private handle?: number;

  constructor(
    private readonly admin: EntityAdmin,
    private readonly callback: UpdateFunction,
    private readonly timestamp: ITimestamp,
  ) {}

  start(): void {
    this.lastTimestamp = this.timestamp.millis();
    this.scheduleUpdate(this.millisPerUpdate);
  }

  stop(): void {
    clearInterval(this.handle);
  }

  private get millisPerUpdate(): number {
    const millisPerTick = this.admin.time().state.millisPerTick;
    const millisPerUpdate = millisPerTick / 4;
    return millisPerUpdate;
  }

  private doUpdate(): void {
    const now = this.timestamp.millis();
    const delta = Math.round(now - this.lastTimestamp);

    let elapsed = 0;
    if (delta > 0) {
      // ignore calls which happen impossibly soon (under 1ms)
      this.lastTimestamp = now;
      this.callback(delta);
      elapsed = this.timestamp.millis() - now;
    }

    this.scheduleUpdate(this.millisPerUpdate - elapsed);
  }

  private scheduleUpdate(timeout: number): void {
    this.handle = setTimeout(() => this.doUpdate(), timeout);
  }
}
