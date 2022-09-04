import { Constructor as Ctor } from "@/app/utils/types";

import { EcsResource, inspectable, inspectableNames } from "@/app/ecs";

import { SystemParamDescriptor } from "../types";
import { getOrAdd } from "@/app/utils/collections";

type Res<R extends EcsResource> = SystemParamDescriptor<R>;
const ResDescriptors = new WeakMap<Ctor<EcsResource>, Res<EcsResource>>();

/** Used to retrieve the resource of type R from the world state. */
export function Res<R extends EcsResource>(ctor: Ctor<R>): Res<R> {
  const cache = ResDescriptors as WeakMap<Ctor<R>, Res<R>>;
  return getOrAdd(cache, ctor, newRes);
}
function newRes<R extends EcsResource>(ctor: Ctor<R>): Res<R> {
  return {
    inspect() {
      return inspectable(Res, inspectableNames([ctor]));
    },
    create({ resources }) {
      return {
        fetch() {
          const res = resources.get(ctor);
          if (res === undefined) {
            throw new Error("Resource not found.");
          }
          return res;
        },
      };
    },
  };
}
