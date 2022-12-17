import { v4 as uuidv4 } from "uuid";

import { SystemParamDescriptor } from "./query/types";
import { inspectable, Inspectable } from "./types";

import { World } from "./world";

export type SystemFn<D extends SystemParamDescriptor[]> = (
  ...args: UnwrapSystemParamTuple<D>
) => void;

export interface SystemSpecification extends Inspectable {
  readonly id: string;
  build(world: World): () => void;
}

export type UnwrapSystemParamTuple<D> = D extends [infer Head, ...infer Tail]
  ? Head extends SystemParamDescriptor<infer Result>
    ? [Result, ...UnwrapSystemParamTuple<Tail>]
    : never[] // deny elements that are not SystemParamDescriptor
  : [];

/**
 * Used to define a system.
 *
 * A system queries a `World` for data and passes the extracted data to a specified runner function.
 * @param ds a tuple of `SystemParamDescriptor` objects
 */
export function System<D extends SystemParamDescriptor[]>(...ds: D) {
  return (fn: SystemFn<D>): SystemSpecification => {
    return {
      id: uuidv4(),
      inspect: () => inspectable(System, ds),
      build(world: World) {
        const params = ds.map((p) => p.create(world));
        return () => {
          const args = params.map((p) =>
            p.fetch(),
          ) as UnwrapSystemParamTuple<D>;
          fn(...args);
          params.forEach((p) => p.cleanup?.());
        };
      },
    };
  };
}
