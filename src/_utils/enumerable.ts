import { all, any } from "./collections";

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

  all(selector: (item: T) => boolean): boolean {
    return all(this, selector);
  }

  any(selector: (item: T) => boolean): boolean {
    return any(this, selector);
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
