import {
  BuildingId,
  FulfillmentId,
  NumberEffectId,
  ResourceId,
  TechId,
} from "@/app/interfaces";

import { SchemaEntity, SchemaComponent, SchemaEvent } from "./schema";

import { CalendarSchema } from "../environment/schema";
import { BuildingSchema, FulfillmentSchema } from "../fulfillment/schema";
import { ResourceSchema } from "../resource/schema";

import { HistoryEvent, Countdown } from "../types";
import { NumberEffectSchema } from "../effects/schema";

type RecordObj = Record<string, unknown>;

type ComponentsSchema = {
  countdowns: {
    rareEvent?: SchemaEntity<SchemaComponent<Countdown>>;
  };
  resources: {
    [K in ResourceId]: SchemaEntity<ResourceSchema>;
  };
  calendar: SchemaEntity<CalendarSchema>;
  numbers: {
    [K in NumberEffectId]: SchemaEntity<NumberEffectSchema>;
  };
  fulfillments: {
    [K in FulfillmentId]: SchemaEntity<FulfillmentSchema>;
  };
  buildings: {
    [K in BuildingId]: SchemaEntity<BuildingSchema>;
  };
  techs: {
    [K in TechId]: SchemaEntity<{
      researched: boolean;
    }>;
  };
  time: SchemaEntity<{
    paused: boolean;
    power: number;
    millisPerTick: number;
  }>;
};

type EventsSchema = {
  history: SchemaEvent<HistoryEvent>;
};

type Serializable<T> = {
  [K in keyof T as Exclude<K, (...args: unknown[]) => unknown>]: T[K];
};

type Present<T> = T extends SchemaEntity<infer E>
  ? Present<E>
  : T extends SchemaComponent<infer C>
  ? Serializable<C>
  : { [K in keyof T]?: Present<T[K]> };

type State<T> = T extends SchemaEntity<infer E>
  ? State<E>
  : T extends SchemaComponent<infer C>
  ? Serializable<C>
  : { [K in keyof T]: State<T[K]> };

type Removed<T> = T extends SchemaEntity
  ? true
  : { [K in keyof T]?: Removed<T[K]> };

export type EventSourceId = keyof EventsSchema;

export type EventSources = {
  [K in keyof EventsSchema]?: EventsSchema[K] extends SchemaEvent<infer E>
    ? Serializable<E>[]
    : never;
};

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
    if (Array.isArray(srcElement)) {
      return srcElement;
    } else if (isObject(srcElement)) {
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
    if (Array.isArray(srcElement)) {
      return srcElement;
    } else if (isObject(srcElement)) {
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

type EventSinkPusher = {
  [K in keyof EventSources]-?: (...items: NonNullable<EventSources[K]>) => void;
};

export function getEventSinkPusher(events: EventSources): EventSinkPusher {
  return new Proxy({} as EventSinkPusher, {
    get(_, propertyKey: keyof EventSources) {
      const array = events[propertyKey] ?? (events[propertyKey] = []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (...items: any[]) => {
        array.push(...items);
      };
    },
  });
}
