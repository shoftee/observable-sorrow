import { Constructor as Ctor } from "@/app/utils/types";

import { ChangeTicksSym, EcsComponent } from "@/app/ecs";

import { defaultQuery, EntityQuery, EntityQueryFactory } from "../types";

type Mut<C extends EcsComponent> = EntityQueryFactory<C>;

/** Include a mutable view of a component in the query results. */
export function Mut<C extends EcsComponent>(ctor: Ctor<C>): Mut<C> {
  return {
    newQuery({ ticks }): EntityQuery<C> {
      return defaultQuery({
        includes({ archetype }) {
          return archetype.has(ctor);
        },
        fetch({ archetype }) {
          const component = archetype.get(ctor)!;
          return new Proxy(component as C, {
            set(target, propertKey, receiver) {
              const success = Reflect.set(target, propertKey, receiver);
              if (success) {
                // set changed tick to current tick from world state
                component[ChangeTicksSym].changed = ticks.current;
              }
              return success;
            },
          });
        },
      });
    },
  };
}

/** Like Mut, but only sets new value if it's strictly different from old value. */
export function DiffMut<C extends EcsComponent>(ctor: Ctor<C>): Mut<C> {
  return {
    newQuery({ ticks }): EntityQuery<C> {
      return defaultQuery({
        includes({ archetype }) {
          return archetype.has(ctor);
        },
        fetch({ archetype }) {
          const component = archetype.get(ctor)!;
          return new Proxy(component as C, {
            set(target, key, value, receiver) {
              const current = Reflect.get(target, key, receiver);
              if (current === value) {
                return true;
              }

              const success = Reflect.set(target, key, value, receiver);
              if (success) {
                // set changed tick to current tick from world state
                component[ChangeTicksSym].changed = ticks.current;
              }
              return success;
            },
          });
        },
      });
    },
  };
}
