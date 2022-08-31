import { World } from "./world";
import { WorldQueryFactoryTuple, WorldQueryTuple } from "./query/types";
import { v4 as uuidv4 } from "uuid";

export type SystemSpecification = {
  id: string;
  build(world: World): SystemRunner;
};

export type SystemRunner = {
  id: string;
  run(): void;
};

type SystemFn<F extends WorldQueryFactoryTuple> = (
  ...args: WorldQueryTuple<F>
) => void;

class SystemBuilder<F extends WorldQueryFactoryTuple> {
  readonly id = uuidv4();

  constructor(private readonly fs: F, private readonly run: SystemFn<F>) {}

  build(world: World): SystemRunner {
    const worldQueries = this.fs.map((f) => f.create(world));
    return {
      id: this.id,
      run: () => {
        const args = worldQueries.map((p) => p.fetch()) as WorldQueryTuple<F>;
        this.run(...args);
        worldQueries.forEach((f) => f.cleanup?.());
      },
    };
  }
}

/**
 * Used to define a system.
 *
 * A system queries a `World` for data and passes the extracted data to a specified runner function.
 * @param fs a tuple of `WorldQueryFactory` objects
 */
export function System<F extends WorldQueryFactoryTuple>(...fs: F) {
  return (runner: SystemFn<F>) => {
    return new SystemBuilder(fs, runner);
  };
}
