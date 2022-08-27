type Cached<T> = { retrieve(): T; invalidate(): void };

/** Returns a caching wrapper of the provided factory function.
 *
 * Calling `retrieve` will call the provided factory function if the cached value is undefined.
 * Calling `invalidate` will reset the cached value to undefined. */
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
