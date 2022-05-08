import { Constructor } from "@/app/utils/types";

export const EntityType = Symbol.for("Entity");
export class EcsEntity {
  [EntityType]: number;
}

export const ChangeTicks = Symbol.for("ChangeTicks");
export abstract class EcsComponent {
  [ChangeTicks]: ComponentTicks;
}

export const ResourceType = Symbol.for("Resource");
export abstract class EcsResource {
  protected [ResourceType]: true;
}

export const EventType = Symbol.for("Event");
export abstract class EcsEvent {
  protected [EventType]: true;
}

export type Archetype<C extends EcsComponent = EcsComponent> = ReadonlyMap<
  Constructor<C>,
  C
>;

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

function compare(
  tick: number,
  systemLast: number,
  systemCurrent: number,
): boolean {
  const componentDelta = systemCurrent - tick;
  const systemDelta = systemCurrent - systemLast;

  return componentDelta < systemDelta;
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
