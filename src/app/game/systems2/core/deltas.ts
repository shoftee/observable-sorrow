import {
  BuildingId,
  FulfillmentId,
  NumberEffectId,
  ResourceId,
  SectionId,
  TechId,
} from "@/app/interfaces";

import { SchemaEntity, SchemaComponent, SchemaEvent } from "./schema";

import { CalendarSchema } from "../environment/schema";
import { BuildingSchema, FulfillmentSchema } from "../fulfillment/schema";
import { ResourceSchema } from "../resource/schema";
import { NumberEffectSchema } from "../effects/schema";
import { SectionSchema } from "../section/schema";

import { TimeSchema } from "../time/schema";
import { HistoryEvent } from "../history/types";

type RecordObj = Record<string, unknown>;

type ComponentsSchema = {
  astronomy: SchemaEntity<{
    hasRareEvent: boolean;
  }>;
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
  sections: {
    [K in SectionId]: SchemaEntity<SectionSchema>;
  };
  time: SchemaEntity<TimeSchema>;
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
  [K in EventSourceId]?: EventsSchema[K] extends SchemaEvent<infer E>
    ? Serializable<E>[]
    : never;
};

export type EventSinks = {
  [K in EventSourceId]?: EventsSchema[K] extends SchemaEvent<infer E>
    ? Iterable<Serializable<E>>
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
      return createDeltaProxy(target[key] ?? (target[key] = {}));
    },
    set(_, key, value) {
      target[key] = value;
      return true;
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
      destination[key] = fn(dstElement, srcElement, key);
    }
  }
}

function isObject<T>(obj: T): obj is T & RecordObj {
  return obj === Object(obj);
}

type EventSinkPusher = {
  [K in EventSourceId]-?: (items: EventSinks[K]) => void;
};

export function getEventSinkPusher(events: EventSources): EventSinkPusher {
  return new Proxy({} as EventSinkPusher, {
    get(_, propertyKey: EventSourceId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (iterable: Iterable<any>) => {
        const items = Array.from(iterable);
        if (items.length > 0) {
          const target = events[propertyKey] ?? (events[propertyKey] = []);
          target.push(...items);
        }
      };
    },
  });
}
