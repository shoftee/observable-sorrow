import { Constructor as Ctor } from "@/app/utils/types";

import {
  Archetype,
  ChangeTicks,
  EcsComponent,
  EcsEntity,
  WorldState,
} from "../world";
import { InstantiatedQuery, QueryDescriptor } from "./types";

type Mut<C extends EcsComponent> = QueryDescriptor<C>;

/** Include a mutable view of a component in the query results. */
export function Mut<C extends EcsComponent>(ctor: Ctor<C>): Mut<C> {
  return {
    newQuery(state: WorldState): InstantiatedQuery<C> {
      return {
        match: (archetype: Archetype) => {
          return archetype.has(ctor);
        },
        fetch: (_: EcsEntity, archetype: Archetype<C>) => {
          const component = archetype.get(ctor)!;
          return new Proxy(component, {
            set(target, propertKey, receiver) {
              const success = Reflect.set(target, propertKey, receiver);
              if (success) {
                // set changed tick to current tick from world state
                component[ChangeTicks].changed = state.world.ticks.current;
              }
              return success;
            },
          });
        },
      };
    },
  };
}
