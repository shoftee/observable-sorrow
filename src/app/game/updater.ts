import { ITimestamp } from "@/_utils/timestamp";

import { TimeConstants } from "../constants";

type UpdateFunction = (deltaTime: number) => void;

export class GameUpdater {
  private lastTimestamp = 0;
  private handle?: number;

  constructor(
    private readonly callback: UpdateFunction,
    private readonly timestamp: ITimestamp,
  ) {}

  start(): void {
    this.lastTimestamp = this.timestamp.millis();

    this.handle = setInterval(
      () => this.doUpdate(),
      TimeConstants.MillisecondsPerUpdate,
    );
  }

  stop(): void {
    this.cancel();
  }

  private doUpdate(): void {
    const now = this.timestamp.millis();
    const delta = Math.round(now - this.lastTimestamp);
    // ignore calls which happen impossibly soon (under 1ms)
    if (delta > 0) {
      this.lastTimestamp = now;
      this.callback(delta);
    }
  }

  private cancel() {
    clearInterval(this.handle);
  }
}
