export type Constructor<T = unknown> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any): T;
};

export interface SetLike<T> {
  has(item: T): boolean;
}

/**
 * Returns the constructor function of obj.
 *
 * If obj has no prototype, or if its prototype has no constructor value, returns undefined.
 */
export function getConstructorOf<O>(obj: O): Constructor<O> | undefined {
  return Object.getPrototypeOf(obj)?.constructor;
}
