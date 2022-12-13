import { Constructor as Ctor } from "@/app/utils/types";

const ENTITY = Symbol.for("Entity");
export class EcsEntity {
  readonly [ENTITY]: number;

  constructor(id: number) {
    this[ENTITY] = id;
  }
}

export const IMMUTABLE = Symbol.for("Immutable");
export const CHANGE_TICKS = Symbol.for("ChangeTicks");

export abstract class EcsComponent {
  [CHANGE_TICKS]!: ComponentTicks;
}

export abstract class MarkerComponent extends EcsComponent {
  [IMMUTABLE] = true;
}

export abstract class ValueComponent<T = unknown> extends EcsComponent {
  abstract get value(): T;
}

export abstract class ReadonlyValueComponent<T> extends ValueComponent<T> {
  [IMMUTABLE] = true;
  constructor(readonly value: T) {
    super();
  }
}

export const RESOURCE = Symbol.for("Resource");
export abstract class EcsResource {
  protected [RESOURCE]!: true;
}

export const EVENT = Symbol.for("Event");
export abstract class EcsEvent {
  protected [EVENT]!: true;
}

export type EcsStageType = "startup" | "first" | "main" | "last";
export type EcsStage =
  | `${EcsStageType}-start`
  | EcsStageType
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

interface Named {
  name: string;
}

type InspectedMetadata = {
  name: string;
  children?: InspectedMetadata[];
  toString(): string;
};
export function toInspectedMetadata(
  inspectable: Inspectable,
): InspectedMetadata {
  const md = inspectable.inspect();
  return {
    name: md.name,
    children: md.children
      ? Array.from(md.children, (c) => toInspectedMetadata(c))
      : undefined,
    toString(): string {
      if (this.children) {
        return `${this.name}[${this.children.join()}]`;
      } else {
        return this.name;
      }
    },
  };
}

export interface Inspectable {
  inspect(): EcsMetadata;
}

export interface EcsMetadata extends Named {
  children?: Iterable<Inspectable>;
}

export function inspectable(
  root: Named,
  children?: Iterable<Inspectable>,
): EcsMetadata {
  if (children) {
    return { name: root.name, children };
  } else {
    return { name: root.name };
  }
}

export function* inspectableNames(
  children: Iterable<Named>,
): Iterable<Inspectable> {
  for (const child of children) {
    yield {
      inspect() {
        return { name: child.name };
      },
    };
  }
}
