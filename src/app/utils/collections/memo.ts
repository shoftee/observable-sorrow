import { getOrAdd } from "./functions";

interface Memoizer<K extends object, V> {
  get(key: K, factory: (key: K) => V): V;
}

export function memoizer<K extends object, V>(): Memoizer<K, V> {
  const store = new WeakMap<K, V>();
  return {
    get(key, factory) {
      return getOrAdd(store, key, factory);
    },
  };
}
