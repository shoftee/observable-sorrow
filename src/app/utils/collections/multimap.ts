import { getOrAdd } from ".";

export class MultiMap<K, V> {
  private readonly map = new Map<K, Set<V>>();

  *entriesForKey(key: K): Iterable<V> {
    const entries = this.map.get(key);
    if (!entries) {
      return;
    }
    for (const entry of entries) {
      yield entry;
    }
  }

  add(key: K, val: V) {
    this.getOrNew(key).add(val);
  }

  addAll(key: K, vals: Iterable<V>) {
    const values = this.getOrNew(key);
    for (const val of vals) {
      values.add(val);
    }
  }

  getOrNew(key: K): Set<V> {
    return getOrAdd(this.map, key, () => new Set<V>());
  }

  remove(key: K, val: V, removeEmpty = false) {
    const entries = this.map.get(key);
    if (entries && entries.delete(val) && entries.size === 0 && removeEmpty) {
      this.map.delete(key);
    }
  }

  removeAll(key: K) {
    this.map.delete(key);
  }

  *[Symbol.iterator]() {
    yield* this.map;
  }
}
