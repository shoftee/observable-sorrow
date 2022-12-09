import { v4 as uuidv4 } from "uuid";

import { SystemParamDescriptor } from "./query/types";
import { inspectable, Inspectable } from "./types";

import { World } from "./world";

export type SystemFn<F extends [...SystemParamDescriptor[]]> = (
  ...args: SystemParamTuple<F>
) => void;

export interface SystemSpecification extends Inspectable {
  readonly id: string;
  build(world: World): () => void;
}

export type SystemParamTuple<F> = F extends [infer Head, ...infer Tail]
  ? [...UnwrapSystemParamDescriptor<Head>, ...SystemParamTuple<Tail>]
  : [];
type UnwrapSystemParamDescriptor<F> = F extends SystemParamDescriptor<infer T>
  ? [T]
  : [];

/**
 * Used to define a system.
 *
 * A system queries a `World` for data and passes the extracted data to a specified runner function.
 * @param ds a tuple of `SystemParamDescriptor` objects
 */
export function System<F extends [...SystemParamDescriptor[]]>(...ds: F) {
  return (fn: SystemFn<F>) => {
    return <SystemSpecification>{
      id: uuidv4(),
      inspect: () => inspectable(System, ds),
      build(world: World) {
        const params = ds.map((f) => f.create(world));
        return () => {
          const args = params.map((p) => p.fetch()) as SystemParamTuple<F>;
          fn(...args);
          params.forEach((f) => f.cleanup?.());
        };
      },
    };
  };
}
