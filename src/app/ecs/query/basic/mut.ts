import { Constructor as Ctor } from "@/app/utils/types";

import {
  Archetype,
  ChangeTicks,
  EcsComponent,
  EcsEntity,
  WorldState,
} from "@/app/ecs";
import { InstantiatedQuery, QueryDescriptor } from "../types";

type Mut<C extends EcsComponent> = QueryDescriptor<C>;

/** Include a mutable view of a component in the query results. */
export function Mut<C extends EcsComponent>(ctor: Ctor<C>): Mut<C> {
  return {
    newQuery(state: WorldState): InstantiatedQuery<C> {
      return {
        includes: (archetype: Archetype) => {
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

/** Like Mut, but checks current value against new value and only sets the new value if they're different. */
export function DiffMut<C extends EcsComponent>(ctor: Ctor<C>): Mut<C> {
  return {
    newQuery(state: WorldState): InstantiatedQuery<C> {
      return {
        includes: (archetype: Archetype) => {
          return archetype.has(ctor);
        },
        fetch: (_: EcsEntity, archetype: Archetype<C>) => {
          const component = archetype.get(ctor)!;
          return new Proxy(component, {
            set(target, key, value, receiver) {
              const current = Reflect.get(target, key, receiver);
              if (current === value) {
                return true;
              }

              const success = Reflect.set(target, key, value, receiver);
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
