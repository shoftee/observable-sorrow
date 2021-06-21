import { ITimestampProvider } from "../core/timestamp-provider";
import { TimeConstants } from "../constants";

type UpdateFunction = (deltaTime: number) => void;

export class GameUpdater {
  private readonly callback: UpdateFunction;
  private readonly timestampProvider: ITimestampProvider;

  private lastTimestamp = 0;
  private handle?: number;

  constructor(callback: UpdateFunction, timestampProvider: ITimestampProvider) {
    this.callback = callback;
    this.timestampProvider = timestampProvider;
  }

  start(): void {
    this.lastTimestamp = this.timestampProvider.millis();

    this.handle = setInterval(
      () => this.doUpdate(),
      TimeConstants.MillisecondsPerUpdate,
    );
  }

  stop(): void {
    this.cancel();
  }

  /** Forces the game to update its internal state.
   *
   * NOTE: Use sparingly! If called because of UI events, throttle the events accordingly.
   */
  force(): boolean {
    // ignore call if another update is expected soon
    const margin = TimeConstants.MillisecondsPerUpdate * 0.1;
    const expectedOn = this.lastTimestamp + TimeConstants.MillisecondsPerUpdate;
    const cutoff = expectedOn - margin;

    const now = this.timestampProvider.millis();
    if (now > cutoff) {
      return false;
    }

    this.doUpdate();

    return true;
  }

  private doUpdate(): void {
    const now = this.timestampProvider.millis();
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
