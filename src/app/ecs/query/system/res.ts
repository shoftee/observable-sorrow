import { memoizer } from "@/app/utils/collections/memo";
import { Constructor as Ctor } from "@/app/utils/types";

import { EcsResource, inspectable, inspectableNames } from "@/app/ecs";

import { SystemParamDescriptor } from "../types";

type Res<R extends EcsResource> = SystemParamDescriptor<R>;
const ResMemo = memoizer<
  Ctor<EcsResource>,
  SystemParamDescriptor<EcsResource>
>();

/** Used to retrieve the resource of type R from the world state. */
export function Res<R extends EcsResource>(ctor: Ctor<R>): Res<R> {
  return ResMemo.get(ctor, newRes) as Res<R>;
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
