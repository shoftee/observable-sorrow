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
    return Enumerable.fromIterable(
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

  static fromArray<T>(items: T[]): Enumerable<T> {
    return new Enumerable<T>(items.values());
  }

  static fromIterable<T>(iterable: Iterable<T>): Enumerable<T> {
    function* iterator() {
      for (const item of iterable) {
        yield item;
      }
    }

    return new Enumerable(iterator());
  }
}
