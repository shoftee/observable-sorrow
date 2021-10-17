import { all, any, count } from "./collections";

const TrueFn = (_: unknown) => true;

export class Enumerable<T> implements Iterable<T> {
  constructor(private readonly iterator: Iterator<T>) {}

  [Symbol.iterator](): Iterator<T> {
    return this.iterator;
  }

  toArray(): T[] {
    return Array.from(this);
  }

  map<TResult>(selector: (item: T) => TResult): Enumerable<TResult> {
    const that = this as Iterable<T>;
    return new Enumerable(
      (function* () {
        for (const item of that) {
          yield selector(item);
        }
      })(),
    );
  }

  all(selector?: (item: T) => boolean): boolean {
    return all(this, selector ?? TrueFn);
  }

  any(selector?: (item: T) => boolean): boolean {
    return any(this, selector ?? TrueFn);
  }

  count(selector?: (item: T) => boolean): number {
    return count(this, selector ?? TrueFn);
  }

  first(): T {
    for (const item of this.take(1)) {
      return item;
    }
    throw new Error(`Expected at least one item but iterable was empty.`);
  }

  take(count: number): Enumerable<T> {
    const that = this as Iterable<T>;
    return new Enumerable(
      (function* () {
        let taken = 0;
        for (const item of that) {
          if (taken++ >= count) break;
          yield item;
        }
      })(),
    );
  }

  filter(selector: (item: T) => boolean): Enumerable<T> {
    const that = this as Iterable<T>;
    return new Enumerable(
      (function* () {
        for (const item of that) {
          if (selector(item)) {
            yield item;
          }
        }
      })(),
    );
  }

  reduce<TResult>(
    seed: TResult,
    accumulator: (acc: TResult, value: T) => TResult,
  ): TResult {
    let accumulate = seed;
    for (const source of this) {
      accumulate = accumulator(accumulate, source);
    }
    return accumulate;
  }
}

export function asEnumerable<T>(iterable: Iterable<T>): Enumerable<T> {
  function* iterator() {
    for (const item of iterable) {
      yield item;
    }
  }

  return new Enumerable(iterator());
}

export function fromObject<K extends string, V>(
  o: Record<string, unknown>,
): Enumerable<[K, V]> {
  return asEnumerable(Object.entries(o)).map(([k, v]) => [k as K, v as V]);
}
