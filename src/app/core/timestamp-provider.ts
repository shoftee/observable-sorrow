export interface ITimestampProvider {
  millis(): number;
}

export class SystemTimestampProvider implements ITimestampProvider {
  millis(): number {
    return Date.now();
  }
}
