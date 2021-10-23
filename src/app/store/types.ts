export type AtomicState<T> = T;
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends AtomicState<T[K]> ? T[K] : DeepPartial<T[K]>;
};
