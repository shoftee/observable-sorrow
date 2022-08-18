import { Constructor as Ctor } from "@/app/utils/types";

import { EcsResource } from "@/app/ecs";
import { FetcherFactory } from "../types";

/** Used to retrieve the resource of type R from the world state. */
export function Res<R extends EcsResource>(ctor: Ctor<R>): FetcherFactory<R> {
  return {
    create(state) {
      return {
        fetch() {
          const res = state.world.resource(ctor);
          if (res === undefined) {
            throw new Error("Resource not found.");
          }
          return res;
        },
      };
    },
  };
}
