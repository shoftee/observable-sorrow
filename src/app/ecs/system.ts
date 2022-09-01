import { v4 as uuidv4 } from "uuid";

import { WorldQueryFactoryTuple, WorldQueryTuple } from "./query/types";

import { World } from "./world";

export type SystemFn<F extends WorldQueryFactoryTuple> = (
  ...args: WorldQueryTuple<F>
) => void;

export interface SystemSpecification {
  readonly id: string;
  build(world: World): () => void;
}

/**
 * Used to define a system.
 *
 * A system queries a `World` for data and passes the extracted data to a specified runner function.
 * @param fs a tuple of `WorldQueryFactory` objects
 */
export function System<F extends WorldQueryFactoryTuple>(...fs: F) {
  return (runner: SystemFn<F>) => {
    return {
      id: uuidv4(),
      build(world: World) {
        const worldQueries = fs.map((f) => f.create(world));
        return () => {
          const args = worldQueries.map((p) => p.fetch()) as WorldQueryTuple<F>;
          runner(...args);
          worldQueries.forEach((f) => f.cleanup?.());
        };
      },
    };
  };
}
