import { Constructor as Ctor } from "@/app/utils/types";

export const EntitySym = Symbol.for("Entity");
export class EcsEntity {
  [EntitySym]!: number;
}

export const ChangeTicksSym = Symbol.for("ChangeTicks");
export abstract class EcsComponent {
  [ChangeTicksSym]!: ComponentTicks;
}

export abstract class ValueComponent<T = unknown> extends EcsComponent {
  abstract get value(): T;
}

export const ResourceSym = Symbol.for("Resource");
export abstract class EcsResource {
  protected [ResourceSym]!: true;
}

export const EventSym = Symbol.for("Event");
export abstract class EcsEvent {
  protected [EventSym]!: true;
}

export type EcsStageType = "startup" | "first" | "main" | "last";
export type EcsStage =
  | EcsStageType
  | `${EcsStageType}-start`
  | `${EcsStageType}-end`;

export type Archetype<C extends EcsComponent = EcsComponent> = ReadonlyMap<
  Ctor<C>,
  C
>;

export class ComponentTicks {
  readonly added: number;
  changed: number | undefined;

  constructor(tick: number) {
    this.added = tick;
  }

  isAdded(last: number, current: number): boolean {
    return compare(this.added, last, current);
  }

  isChanged(last: number, current: number): boolean {
    const changed = this.changed;
    return changed !== undefined && compare(changed, last, current);
  }
}

function compare(tick: number, last: number, current: number): boolean {
  return current - tick < current - last;
}

export class WorldTicks {
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
