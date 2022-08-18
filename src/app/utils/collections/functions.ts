import { SetLike } from "../types";

/** Map-reduce combination for generic iterables. */
export function reduce<T, TResult>(
  iterable: Iterable<T>,
  map: (item: T) => TResult,
  reduce: (accumulator: TResult, current: TResult) => TResult,
  initial: TResult,
): TResult {
  let accumulator = initial;
  for (const item of iterable) {
    const mapped = map(item);
    accumulator = reduce(accumulator, mapped);
  }
  return accumulator;
}

/** Returns true iff no provided entries map to false. */
export function all<T>(
  iterable: Iterable<T>,
  map: (item: T) => boolean,
): boolean {
  for (const item of iterable) {
    if (map(item) === false) {
      return false;
    }
  }
  return true;
}

/** Returns true iff a provided entry maps to true. */
export function any<T>(
  iterable: Iterable<T>,
  map: (item: T) => boolean,
): boolean {
  for (const item of iterable) {
    if (map(item) === true) {
      return true;
    }
  }
  return false;
}

/** Counts the items that return true for the specified condition. */
export function count<T>(
  iterable: Iterable<T>,
  filter: (item: T) => boolean,
): number {
  let count = 0;
  for (const item of iterable) {
    if (filter(item) === true) {
      count++;
    }
  }
  return count;
}

/** Retrieves the value for key from map, or calls factory to create a value for it if it is not present. */
export function getOrAdd<K, V>(
  map: Map<K, V>,
  key: K,
  factory: (key: K) => V,
): V {
  let existing = map.get(key);
  if (existing === undefined) {
    existing = factory(key);
    map.set(key, existing);
  }
  return existing;
}

/** Returns whether first contains all elements from second. */
export function containsAll<T>(
  first: SetLike<T>,
  second: Iterable<T>,
): boolean {
  for (const item of second) {
    if (!first.has(item)) {
      return false;
    }
  }
  return true;
}

export function single<T>(iterable: Iterable<T>): T {
  let found;
  for (const item of iterable) {
    if (found !== undefined) {
      throw new Error("Iterable produced more than one item.");
    } else {
      found = item;
    }
  }
  if (found === undefined) {
    throw new Error("Iterable produced no items.");
  }
  return found;
}

export function cache<T>(getter: () => T): () => T {
  let cached: T | undefined;
  return () => cached ?? (cached = getter());
}
