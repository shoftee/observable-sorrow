import { WorldState } from "./world";
import { FetcherFactory } from "./query/types";
import { v4 as uuidv4 } from "uuid";

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

export type SystemSpecification<R = void> = {
  id: string;
  build(state: WorldState): SystemRunner<R>;
};

export type SystemRunner<Result = void> = {
  id: string;
  run(): Result;
};

class SystemBuilder<F extends FactoryTuple, R> {
  readonly id = uuidv4();

  constructor(
    private readonly factories: F,
    private readonly run: RunnerFn<F, R>,
  ) {}

  build(state: WorldState): SystemRunner<R> {
    const fetchers = this.factories.map((f) => f.create(state));
    return {
      id: this.id,
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
