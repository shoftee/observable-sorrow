// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<T = any> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any): T;
};

export interface SetLike<T> {
  has(item: T): boolean;
}

/** Returns the constructor function of obj. */
export function getConstructorOf<O>(obj: O): Constructor<O> {
  return Object.getPrototypeOf(obj).constructor;
}
