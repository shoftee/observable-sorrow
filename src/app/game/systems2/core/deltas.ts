import { EcsComponent } from "@/app/ecs";
import {
  BuildingId,
  FulfillmentId,
  ResourceId,
  SeasonId,
  TechId,
  WeatherId,
} from "@/app/interfaces";
import { HistoryEvent, Countdown } from "../types";

type RecordObj = Record<string, unknown>;

const ComponentMarkerSymbol = Symbol();
class Component<C extends EcsComponent = EcsComponent> {
  [ComponentMarkerSymbol]!: C;
}

const EntityMarkerSymbol = Symbol();
class Entity<T = unknown> {
  [EntityMarkerSymbol]!: T;
}

type Serializable<T> = {
  [K in keyof T as Exclude<K, (...args: unknown[]) => unknown>]: T[K];
};

type IngredientSchema = Entity<{
  requirement: number;
  fulfilled: boolean;
  eta: number | undefined;
  capped: boolean;
  ingredients: IngredientsSchema;
}>;

type IngredientsSchema = Partial<{
  [K in ResourceId]: IngredientSchema;
}>;

type ComponentsSchema = {
  countdowns: {
    rareEvent?: Entity<Component<Countdown>>;
  };
  resources: {
    [K in ResourceId]: Entity<{
      amount: number;
      delta?: number;
      capacity?: number;
      unlocked: boolean;
    }>;
  };
  calendar: Entity<{
    day: number;
    season: SeasonId;
    year: number;
    weather: WeatherId;
    dateLabel: string;
    epochLabel: string;
  }>;
  fulfillments: {
    [K in FulfillmentId]: Entity<{
      fulfilled: boolean;
      capped: boolean;
      unlocked: boolean;
      ingredients: IngredientsSchema;
    }>;
  };
  buildings: {
    [K in BuildingId]: Entity<{
      level: number;
    }>;
  };
  techs: {
    [K in TechId]: Entity<{
      researched: boolean;
    }>;
  };
  time: Entity<{
    paused: boolean;
    power: number;
  }>;
};

export type EventsSchema = {
  history?: HistoryEvent[];
};

type Present<T> = T extends Entity<infer E>
  ? Present<E>
  : T extends Component<infer C>
  ? Serializable<C>
  : { [K in keyof T]?: Present<T[K]> };

type State<T> = T extends Entity<infer E>
  ? State<E>
  : T extends Component<infer C>
  ? Serializable<C>
  : { [K in keyof T]: State<T[K]> };

type Removed<T> = T extends Entity ? true : { [K in keyof T]?: Removed<T[K]> };

export type DeltaSchema = Present<ComponentsSchema>;
export type StateSchema = State<ComponentsSchema>;
export type RemovedDeltaSchema = Removed<ComponentsSchema>;

export function visitState<T extends RecordObj>(dst: T, fn: (root: T) => void) {
  fn(createDeltaProxy(dst));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createDeltaProxy(target: any): any {
  return new Proxy(target, {
    get(_, key) {
      let innerTarget = Reflect.get(target, key);
      if (innerTarget === undefined) {
        innerTarget = {};
        Reflect.set(target, key, innerTarget);
      }
      return createDeltaProxy(innerTarget);
    },
    set(_, key, value) {
      return Reflect.set(target, key, value);
    },
  });
}

export function addState(dst: DeltaSchema, src: DeltaSchema) {
  return addStateDeep(dst, src);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function addStateDeep(destination: any, source: any) {
  mergeWith(destination, source, (dstElement, srcElement) => {
    if (isObject(srcElement)) {
      if (dstElement === undefined) {
        const newDstElement = {};
        addStateDeep(newDstElement, srcElement);
        return newDstElement;
      }

      if (isObject(dstElement)) {
        // update existing object
        addStateDeep(dstElement, srcElement);
        return dstElement;
      }
    } else {
      return srcElement;
    }
  });
}

export function changeState(dst: DeltaSchema, src: DeltaSchema) {
  changeStateDeep(dst, src);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function changeStateDeep<T extends RecordObj>(destination: T, source: T) {
  mergeWith(destination, source, (dstElement, srcElement) => {
    if (isObject(srcElement)) {
      if (dstElement !== undefined) {
        if (isObject(dstElement)) {
          changeStateDeep(dstElement, srcElement);
          return dstElement;
        }
      } else {
        const newDstElement = {};
        changeStateDeep(newDstElement, srcElement);
        return newDstElement;
      }
    } else {
      return srcElement;
    }
  });
}

export function removeState(dst: DeltaSchema, src: RemovedDeltaSchema) {
  removeStateDeep(dst, src);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function removeStateDeep(destination: any, source: any) {
  mergeWith(destination, source, (dstElement, srcElement) => {
    if (srcElement === true) {
      return undefined;
    }
    if (isObject(dstElement)) {
      removeStateDeep(dstElement, srcElement);
      return dstElement;
    }
  });
}

export function mergeRemovals(
  dst: RemovedDeltaSchema,
  src: RemovedDeltaSchema,
) {
  mergeRemovalsDeep(dst, src);
}

function mergeRemovalsDeep<T extends RecordObj>(destination: T, source: T) {
  mergeWith(destination, source, (dstElement, srcElement) => {
    if (isObject(srcElement)) {
      if (dstElement === undefined) {
        return srcElement;
      }
      if (isObject(dstElement)) {
        mergeRemovalsDeep(dstElement, srcElement);
        return dstElement;
      }

      throw new Error(
        `Types of property in source and destination did not match.`,
      );
    } else if (srcElement === true) {
      return true;
    } else {
      throw new Error(`Unexpected source element ${srcElement}.`);
    }
  });
}

function mergeWith<T1 extends RecordObj, T2 extends RecordObj>(
  destination: T1,
  source: T2,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (dst: T1[keyof T1] | undefined, src: T2[keyof T2], key: keyof T2) => any,
) {
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const dstElement = destination[key];
      const srcElement = source[key];
      const newValue = fn(dstElement, srcElement, key);
      Reflect.set(destination, key, newValue);
    }
  }
}

function isObject<T>(obj: T): obj is T & RecordObj {
  return obj === Object(obj);
}
