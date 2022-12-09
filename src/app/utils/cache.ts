interface Cached<T> {
  /** Retrieves the cached value. If uninitialized, will call the factory function and cache the result. */
  retrieve(): T;
  /** Resets the cache to its uninitialized state. */
  invalidate(): void;
}

/** Returns a caching wrapper of the provided factory function. */
export function cache<T>(getter: () => T): Cached<T> {
  let cached: T | undefined;
  return {
    retrieve() {
      return cached ?? (cached = getter());
    },
    invalidate() {
      cached = undefined;
    },
  };
}
