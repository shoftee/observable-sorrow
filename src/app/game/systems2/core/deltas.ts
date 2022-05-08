import { EcsComponent } from "@/app/ecs";
import { Calendar, Resource, HistoryEvent } from "../types";

type RecordObj = Record<string, unknown>;

const MarkerSymbol = Symbol();
class ComponentMarker<C extends EcsComponent = EcsComponent> {
  [MarkerSymbol]: C;
}

type Serializable<T> = {
  [K in Extract<keyof T, string>]: T[K];
};

type ComponentsSchema = {
  calendar: ComponentMarker<Calendar>;
  resources: {
    catnip: ComponentMarker<Resource>;
  };
};

export type EventsSchema = {
  history?: HistoryEvent[];
};

type Present<T> = T extends ComponentMarker<infer V>
  ? Serializable<V>
  : { [K in keyof T]?: Present<T[K]> };

type Removed<T> = T extends ComponentMarker
  ? true
  : { [K in keyof T]?: Removed<T[K]> };

export type DeltaSchema = Present<ComponentsSchema>;
export type RemovedDeltaSchema = Removed<ComponentsSchema>;

export function addState(dst: DeltaSchema, src: DeltaSchema) {
  return addStateDeep(dst, src);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function addStateDeep(destination: any, source: any) {
  mergeWith(destination, source, (dstElement, srcElement) => {
    if (srcElement instanceof EcsComponent) {
      return mergeProperties({}, srcElement);
    }

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

      throw new Error(
        `Expected property to be an object, but found ${dstElement} instead.`,
      );
    }
  });
}

export function changeState(dst: DeltaSchema, src: DeltaSchema) {
  changeStateDeep(dst, src);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function changeStateDeep<T extends RecordObj>(destination: T, source: T) {
  mergeWith(destination, source, (dstElement, srcElement) => {
    if (srcElement instanceof EcsComponent) {
      if (dstElement !== undefined) {
        return mergeProperties(dstElement, srcElement);
      } else {
        return mergeProperties({}, srcElement);
      }
    }

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
    }

    throw new Error(
      `Types of property in source and destination did not match.`,
    );
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mergeProperties(dst: any, src: any) {
  for (const key in src) {
    if (Object.prototype.hasOwnProperty.call(src, key)) {
      dst[key] = src[key];
    }
  }
  return dst;
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
    if (srcElement === true) {
      return true;
    }
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
    }

    throw new Error(`Unexpected type for property: ${srcElement}.`);
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
