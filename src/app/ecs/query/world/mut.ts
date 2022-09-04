import { getOrAdd } from "@/app/utils/collections";
import { Constructor as Ctor } from "@/app/utils/types";

import {
  ChangeTicksSym,
  EcsComponent,
  inspectableNames,
  inspectable,
} from "@/app/ecs";

import { WorldQuery, QueryDescriptor } from "../types";

type Mut<C extends EcsComponent> = QueryDescriptor<C>;
const MutDescriptors = new WeakMap<Ctor<EcsComponent>, Mut<EcsComponent>>();
const DiffMutDescriptors = new WeakMap<Ctor<EcsComponent>, Mut<EcsComponent>>();

/** Include a mutable view of a component in the query results. */
export function Mut<C extends EcsComponent>(ctor: Ctor<C>): Mut<C> {
  const cache = MutDescriptors as WeakMap<Ctor<C>, QueryDescriptor<C>>;
  return getOrAdd(cache, ctor, newMut);
}
function newMut<C extends EcsComponent>(ctor: Ctor<C>): QueryDescriptor<C> {
  return {
    inspect() {
      return inspectable(Mut, inspectableNames([ctor]));
    },
    includes(archetype) {
      return archetype.has(ctor);
    },
    newQuery({ ticks }) {
      return {
        fetch({ archetype }) {
          const component = archetype.get(ctor)!;
          return new Proxy(component as C, {
            set(target, property, receiver) {
              const success = Reflect.set(target, property, receiver);
              if (success) {
                // set changed tick to current tick from world state
                component[ChangeTicksSym].changed = ticks.current;
              }
              return success;
            },
          });
        },
      };
    },
  };
}

/** Like Mut, but only sets new value if it's strictly different from old value. */
export function DiffMut<C extends EcsComponent>(ctor: Ctor<C>): Mut<C> {
  const cache = DiffMutDescriptors as WeakMap<Ctor<C>, Mut<C>>;
  return getOrAdd(cache, ctor, newDiffMut);
}
function newDiffMut<C extends EcsComponent>(ctor: Ctor<C>): Mut<C> {
  return {
    inspect() {
      return inspectable(DiffMut, inspectableNames([ctor]));
    },
    includes(archetype) {
      return archetype.has(ctor);
    },
    newQuery({ ticks }): WorldQuery<C> {
      return {
        fetch({ archetype }) {
          const component = archetype.get(ctor)!;
          return new Proxy(component as C, {
            set(target, property, value, receiver) {
              const current = Reflect.get(target, property, receiver);
              if (current === value) {
                return true;
              }

              const success = Reflect.set(target, property, value, receiver);
              if (success) {
                // set changed tick to current tick from world state
                component[ChangeTicksSym].changed = ticks.current;
              }
              return success;
            },
          });
        },
      };
    },
  };
}
