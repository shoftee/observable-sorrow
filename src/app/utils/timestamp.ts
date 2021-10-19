export interface ITimestamp {
  millis(): number;
}

export class SystemTimestamp implements ITimestamp {
  millis(): number {
    return Date.now();
  }
}
