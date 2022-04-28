import { Constructor, SetLike } from "./types";

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

export class MultiMap<K, V> {
  private readonly map = new Map<K, Set<V>>();

  *entriesForKey(key: K): Iterable<V> {
    const entries = this.map.get(key);
    if (!entries) {
      return;
    }
    for (const entry of entries) {
      yield entry;
    }
  }

  add(key: K, val: V) {
    this.getOrNew(key).add(val);
  }

  addAll(key: K, vals: Iterable<V>) {
    const values = this.getOrNew(key);
    for (const val of vals) {
      values.add(val);
    }
  }

  getOrNew(key: K): Set<V> {
    return getOrAdd(this.map, key, () => new Set<V>());
  }

  remove(key: K, val: V, removeEmpty = false) {
    const entries = this.map.get(key);
    if (entries && entries.delete(val) && entries.size === 0 && removeEmpty) {
      this.map.delete(key);
    }
  }

  removeAll(key: K) {
    this.map.delete(key);
  }

  *[Symbol.iterator]() {
    yield* this.map;
  }
}

export class TypeSet<V> {
  private readonly map = new Map<Constructor<V>, V>();

  add(value: V): void {
    const ctor = getConstructorOf(value);
    if (!ctor) {
      throw new Error("The provided value does not have a constructor");
    }
    if (this.map.has(ctor)) {
      throw new Error("The provided value is already in the set");
    }
    this.map.set(ctor, value);
  }

  get<T extends V>(ctor: Constructor<T>): T | undefined {
    return this.map.get(ctor) as T;
  }

  has<T extends V>(ctor: Constructor<T>): boolean {
    return this.map.has(ctor);
  }
}

function getConstructorOf<O>(obj: O) {
  return Object.getPrototypeOf(obj).constructor;
}
