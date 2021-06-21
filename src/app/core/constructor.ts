export type Constructor<T> = { new (...args: unknown[]): T };

export type Resolver<TService> = {
  get<TImpl extends TService>(id: string, constr: Constructor<TImpl>): TImpl;
};
