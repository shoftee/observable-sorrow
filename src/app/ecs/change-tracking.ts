export class ComponentTicks {
  readonly added: number;
  changed: number;

  constructor(tick: number) {
    this.added = this.changed = tick;
  }

  isAdded(last: number, current: number): boolean {
    return compare(this.added, last, current);
  }

  isChanged(last: number, current: number): boolean {
    return compare(this.changed, last, current);
  }
}

export class SystemTicks {
  private _last: number;
  private _current: number;

  constructor() {
    this._last = 0;
    this._current = 1;
  }

  get last() {
    return this._last;
  }

  get current() {
    return this._current;
  }

  advance(): number {
    return this._current++;
  }

  updateLast() {
    this._last = this.advance();
  }
}

function compare(
  tick: number,
  systemLast: number,
  systemCurrent: number,
): boolean {
  const componentDelta = systemCurrent - tick;
  const systemDelta = systemCurrent - systemLast;

  return componentDelta < systemDelta;
}
