import { EcsComponent } from "@/app/ecs";
import { Calendar, Resource, HistoryEvent } from "../types";

type RecordObj = Record<string, unknown>;

type ComplexState<T> = T extends Record<string, unknown> ? T : never;

type ComponentsSchema = ComplexState<{
  calendar: Calendar;
  resources: ComplexState<{
    catnip: Resource;
  }>;
}>;

export type EventsSchema = {
  history?: HistoryEvent[];
};

type Present<T> = T extends ComplexState<infer S>
  ? { [K in keyof S]?: Present<S[K]> }
  : T;

type Removed<T> = T extends ComplexState<infer S>
  ? { [K in keyof S]?: Removed<S[K]> }
  : true;

export type DeltaSchema = Present<ComponentsSchema>;
export type RemovedDeltaSchema = Removed<ComponentsSchema>;

export function addState(dst: DeltaSchema, src: DeltaSchema) {
  return addStateDeep(dst, src);
}

function addStateDeep<T extends RecordObj>(destination: T, source: T) {
  mergeWith(destination, source, (dstElement, srcElement, key) => {
    if (srcElement instanceof EcsComponent) {
      return srcElement;
    }

    if (isObject(srcElement)) {
      if (dstElement === undefined) {
        // property is missing, set it directly
        return srcElement;
      }

      if (isObject(dstElement)) {
        // update existing object
        addStateDeep(dstElement, srcElement);
        return dstElement;
      }

      throw new Error(
        `Expected property ${key} to be an object, but found ${dstElement} instead.`,
      );
    }
  });
}

export function changeState(dst: DeltaSchema, src: DeltaSchema) {
  changeStateDeep(dst, src);
}

function changeStateDeep<T extends RecordObj>(destination: T, source: T) {
  mergeWith(destination, source, (dstElement, srcElement, key) => {
    if (dstElement === undefined) {
      // property is missing, write source directly.
      return srcElement;
    }
    if (
      srcElement instanceof EcsComponent &&
      dstElement instanceof EcsComponent
    ) {
      mergeProperties(dstElement, srcElement);
      return dstElement;
    }
    if (isObject(srcElement) && isObject(dstElement)) {
      changeState(srcElement, dstElement);
      return dstElement;
    }

    throw new Error(
      `Types of property ${key} in source and destination did not match.`,
    );
  });
}

function mergeProperties<C extends EcsComponent>(dst: C, src: C) {
  for (const key in src) {
    if (Object.prototype.hasOwnProperty.call(src, key)) {
      dst[key] = src[key];
    }
  }
}

type RemovalSource<T> = T extends ComplexState<infer S>
  ? { [K in keyof S]: RemovalSource<S[K]> }
  : true;

export function removeState(dst: DeltaSchema, src: RemovedDeltaSchema) {
  removeStateDeep(dst, src);
}

function removeStateDeep<T extends RecordObj>(
  destination: T,
  source: RemovalSource<T>,
) {
  mergeWith(destination, source, (dstElement, srcElement) => {
    if (srcElement === true) {
      return undefined;
    }
    if (isObject(dstElement)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      removeStateDeep(dstElement, srcElement as any);
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
  mergeWith(destination, source, (dstElement, srcElement, key) => {
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
        `Types of property ${key} in source and destination did not match.`,
      );
    }

    throw new Error(`Unexpected type for property ${key}: ${srcElement}.`);
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
