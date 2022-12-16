import { Queue } from "queue-typescript";

/** Map-reduce combination for generic iterables. */
export function reduce<T, TResult>(
  iterable: Iterable<T>,
  proj: (item: T) => TResult,
  acc: (accumulator: TResult, current: TResult) => TResult,
  initial: TResult,
): TResult {
  let accumulator = initial;
  for (const item of iterable) {
    const mapped = proj(item);
    accumulator = acc(accumulator, mapped);
  }
  return accumulator;
}

/** Returns true iff no elements of `iterable` return `false` from `predicate`. */
export function all<T>(
  iterable: Iterable<T>,
  predicate: (item: T) => boolean,
): boolean {
  for (const item of iterable) {
    if (predicate(item) === false) {
      return false;
    }
  }
  return true;
}

/** Returns true iff at least one element of `iterable` returns `true` from `predicate`. */
export function any<T>(
  iterable: Iterable<T>,
  predicate: (item: T) => boolean,
): boolean {
  for (const item of iterable) {
    if (predicate(item) === true) {
      return true;
    }
  }
  return false;
}

/** Generates a new iterable by calling `selector` on each element of `iterable`. */
export function* map<T, V>(
  iterable: Iterable<T>,
  selector: (item: T) => V,
): Iterable<V> {
  for (const item of iterable) {
    yield selector(item);
  }
}

export function* flatMap<T, V>(
  iterable: Iterable<T>,
  selector: (item: T) => Iterable<V>,
): Iterable<V> {
  for (const projected of map(iterable, selector)) {
    yield* projected;
  }
}

export function* filter<T>(
  iterable: Iterable<T>,
  predicate: (item: T) => boolean,
): Iterable<T> {
  for (const item of iterable) {
    if (predicate(item)) {
      yield item;
    }
  }
}

export function* ofType<T, V extends T>(
  iterable: Iterable<T>,
  assertion: (item: T) => item is V,
): Iterable<V> {
  for (const item of iterable) {
    if (assertion(item)) {
      yield item;
    }
  }
}

export function untuple<T>(iterable: Iterable<[T]>): Iterable<T> {
  return map(iterable, ([element]) => element);
}

export function* defined<T>(iterable: Iterable<T>): Iterable<NonNullable<T>> {
  for (const item of iterable) {
    if (item !== undefined && item !== null) {
      yield item!;
    }
  }
}

export function firstOrDefault<T>(
  iterable: Iterable<T>,
  defaultValue?: T,
): T | undefined {
  for (const item of iterable) {
    return item;
  }
  return defaultValue;
}

/** Counts how many items from `iterable` return true from `predicate`. */
export function count<T>(
  iterable: Iterable<T>,
  predicate: (item: T) => boolean,
): number {
  let count = 0;
  for (const item of iterable) {
    if (predicate(item) === true) {
      count++;
    }
  }
  return count;
}

/** Generates an iterable that includes a 0-based index for each element of `iterable`. */
export function* enumerate<T>(iterable: Iterable<T>): Iterable<[T, number]> {
  let i = 0;
  for (const item of iterable) {
    yield [item, i++];
  }
}

export function* concat<T>(
  first: Iterable<T>,
  ...others: Iterable<T>[]
): Iterable<T> {
  yield* first;
  for (const other of others) {
    yield* other;
  }
}

type GetOrAddMap<K, V> = {
  get(key: K): V | undefined;
  set(key: K, value: V): void;
};

/** Retrieves the value for `key` from `map`, or calls `factory` to create a value for it if it is not present. */
export function getOrAdd<K, V>(
  map: GetOrAddMap<K, V>,
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

/** Returns whether `first` contains all elements from `second`. */
export function containsAll<T>(
  first: { has(item: T): boolean },
  second: Iterable<T>,
): boolean {
  for (const item of second) {
    if (!first.has(item)) {
      return false;
    }
  }
  return true;
}

/** Returns the first element of `iterable`. If `iterable` has 0 or more than 1 elements, throws an error. */
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

/** Returns the first `count` elements of `iterable`. */
export function* take<T>(iterable: Iterable<T>, count: number): Iterable<T> {
  let taken = 0;
  for (const item of iterable) {
    if (taken >= count) {
      break;
    }
    yield item;
    taken++;
  }
}

/** Adds all elements of the `iterable` to `set`. */
export function addRange<T>(set: Set<T>, iterable: Iterable<T>) {
  for (const item of iterable) {
    set.add(item);
  }
}

/** Generates an iterable by dequeueing the elements `queue`. */
export function* consume<T>(queue: Queue<T>): Iterable<T> {
  let next;
  while ((next = queue.dequeue())) {
    yield next;
  }
}

/** Enqueues all elements of `iterable` into `queue`. */
export function enqueueAll<T>(queue: Queue<T>, values: Iterable<T>) {
  for (const value of values) {
    queue.enqueue(value);
  }
}
