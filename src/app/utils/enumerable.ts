import { all, any, count } from "./collections";

const TrueFn = (_: unknown) => true;

export class Enumerable<T> implements Iterable<T> {
  constructor(private readonly iterable: Iterable<T>) {}

  *[Symbol.iterator](): Iterator<T> {
    yield* this.iterable;
  }

  toArray(): T[] {
    return Array.from(this);
  }

  toMap<K, V>(
    keySelector: (item: T) => K,
    valueSelector: (item: T) => V,
  ): Map<K, V> {
    return new Map<K, V>(this.map((i) => [keySelector(i), valueSelector(i)]));
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

  flatMap<TResult>(
    selector: (item: T) => Iterable<TResult>,
  ): Enumerable<TResult> {
    const that = this as Iterable<T>;
    return new Enumerable(
      (function* () {
        for (const outer of that) {
          for (const inner of selector(outer)) {
            yield inner;
          }
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
    for (const item of this) {
      return item;
    }
    throw new Error("Expected at least one item but iterable was empty.");
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

  filterMap<V>(
    selector: (item: T) => V | undefined,
  ): Enumerable<Exclude<V, undefined>> {
    return this.map(selector).defined();
  }

  defined(): Enumerable<Exclude<T, undefined>> {
    const that = this as Iterable<T>;
    return new Enumerable(
      (function* () {
        for (const item of that) {
          if (item !== undefined) {
            yield item as Exclude<T, undefined>;
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

export function fromObject<K extends string, V>(
  o: Record<string, unknown>,
): Enumerable<[K, V]> {
  return new Enumerable(Object.entries(o)).map(([k, v]) => [k as K, v as V]);
}
