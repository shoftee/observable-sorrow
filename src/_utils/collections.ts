export function mapReduce<T, TResult>(
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
