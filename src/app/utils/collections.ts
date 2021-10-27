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

// Returns true iff no provided entries map to false.
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

// Returns true iff a provided entry maps to true.
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

// Counts the items that return true for the specified condition.
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
