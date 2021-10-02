export function reduce<T, TResult>(
  iterable: IterableIterator<T>,
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

export function all<T>(
  iterable: IterableIterator<T>,
  map: (item: T) => boolean,
): boolean {
  return reduce(iterable, map, (acc, val) => acc && val, true);
}

export function any<T>(
  iterable: IterableIterator<T>,
  map: (item: T) => boolean,
): boolean {
  return reduce(iterable, map, (acc, val) => acc || val, false);
}
