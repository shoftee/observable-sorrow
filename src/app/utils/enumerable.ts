import {
  all,
  any,
  concat,
  count,
  defined,
  enumerate,
  filter,
  flatMap,
  map,
  take,
} from "./collections";

const TrueFn = (_: unknown) => true;

export class Enumerable<T> implements Iterable<T> {
  constructor(private readonly iterable: Iterable<T>) {}

  *[Symbol.iterator](): Iterator<T> {
    yield* this.iterable;
  }

  map<TResult>(selector: (item: T) => TResult): Enumerable<TResult> {
    return new Enumerable(map(this, selector));
  }

  flatMap<TResult>(
    selector: (item: T) => Iterable<TResult>,
  ): Enumerable<TResult> {
    return new Enumerable(flatMap(this, selector));
  }

  concat(...others: Iterable<T>[]): Enumerable<T> {
    return new Enumerable(concat(this, ...others));
  }

  take(count: number): Enumerable<T> {
    return new Enumerable(take(this, count));
  }

  filter(predicate: (item: T) => boolean): Enumerable<T> {
    return new Enumerable(filter(this, predicate));
  }

  filterMap<V>(
    selector: (item: T) => V | undefined,
  ): Enumerable<NonNullable<V>> {
    return new Enumerable(defined(map(this, selector)));
  }

  defined(): Enumerable<NonNullable<T>> {
    return new Enumerable(defined(this));
  }

  enumerate(): Enumerable<[T, number]> {
    return new Enumerable(enumerate(this));
  }

  toArray(): T[] {
    return Array.from(this);
  }

  toMap<K, V>(
    keySelector: (item: T) => K,
    valueSelector: (item: T) => V,
  ): Map<K, V> {
    return new Map<K, V>(map(this, (i) => [keySelector(i), valueSelector(i)]));
  }

  all(predicate?: (item: T) => boolean): boolean {
    return all(this, predicate ?? TrueFn);
  }

  any(predicate?: (item: T) => boolean): boolean {
    return any(this, predicate ?? TrueFn);
  }

  count(predicate?: (item: T) => boolean): number {
    return count(this, predicate ?? TrueFn);
  }

  first(): T {
    for (const item of this) {
      return item;
    }
    throw new Error("Expected at least one item but iterable was empty.");
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
