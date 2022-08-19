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

type RunnerFn<F extends FactoryTuple> = (...args: ResultTuple<F>) => void;

export type SystemSpecification = {
  id: string;
  build(state: WorldState): SystemRunner;
};

export type SystemRunner = {
  id: string;
  run(): void;
};

class SystemBuilder<F extends FactoryTuple> {
  readonly id = uuidv4();

  constructor(
    private readonly factories: F,
    private readonly run: RunnerFn<F>,
  ) {}

  build(state: WorldState): SystemRunner {
    const fetchers = this.factories.map((f) => f.create(state));
    return {
      id: this.id,
      run: () => {
        const args = fetchers.map((p) => p.fetch()) as ResultTuple<F>;
        this.run(...args);
        fetchers.forEach((f) => f.cleanup?.());
      },
    };
  }
}

export function System<F extends FactoryTuple>(...f: F) {
  return (runner: RunnerFn<F>) => {
    return new SystemBuilder(f, runner);
  };
}
