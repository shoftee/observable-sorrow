import { Constructor, getConstructorOf } from "../types";

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

  *entries(): Iterable<[Constructor<V>, V]> {
    yield* this.map.entries();
  }
}
