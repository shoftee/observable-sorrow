import { WorldState } from "./world";
import { FetcherFactory } from "./query/types";

type FactoryTuple = [...FetcherFactory[]];

type ResultTuple<FactoryTuple> = FactoryTuple extends [
  infer Head,
  ...infer Tail,
]
  ? [...UnwrapResultFromFactory<Head>, ...ResultTuple<Tail>]
  : [];
type UnwrapResultFromFactory<Factory> = Factory extends FetcherFactory<infer T>
  ? [T]
  : [];

type RunnerFn<F extends FactoryTuple, Result> = (
  ...args: ResultTuple<F>
) => Result;

export type IntoSystem<R = void> = {
  intoSystem(state: WorldState): SystemRunner<R>;
};

export type SystemRunner<Result = void> = {
  run(): Result;
};

class SystemBuilder<F extends FactoryTuple, R> {
  constructor(
    private readonly factories: F,
    private readonly run: RunnerFn<F, R>,
  ) {}

  intoSystem(state: WorldState): SystemRunner<R> {
    const fetchers = this.factories.map((f) => f.create(state));
    return {
      run: () => {
        const args = fetchers.map((p) => p.fetch()) as ResultTuple<F>;
        return this.run(...args);
      },
    };
  }
}

export function System<F extends FactoryTuple>(...f: F) {
  return (runner: RunnerFn<F, void>) => {
    return new SystemBuilder(f, runner);
  };
}

export function RunCondition<F extends FactoryTuple>(...f: F) {
  return (runner: RunnerFn<F, boolean>) => {
    return new SystemBuilder(f, runner);
  };
}
