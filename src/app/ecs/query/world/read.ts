import { getOrAdd } from "@/app/utils/collections";
import { Constructor as Ctor } from "@/app/utils/types";

import {
  EcsComponent,
  inspectableNames,
  inspectable,
  ValueComponent,
} from "@/app/ecs";

import { QueryDescriptor } from "../types";

type Value<C extends EcsComponent> = C extends ValueComponent<infer T>
  ? Readonly<T>
  : never;

const ReadDescriptors = new WeakMap<Ctor<EcsComponent>, Read<EcsComponent>>();
const ValueDescriptors = new WeakMap<
  Ctor<EcsComponent>,
  QueryDescriptor<Value<EcsComponent>>
>();

type Read<C extends EcsComponent> = QueryDescriptor<Readonly<C>>;
type ValueDescriptor<C extends EcsComponent> = QueryDescriptor<Value<C>>;

/** Include a read-only view of a component in the query results. */
export function Read<C extends EcsComponent>(ctor: Ctor<C>) {
  const cache = ReadDescriptors as Map<Ctor<C>, Read<C>>;
  return getOrAdd(cache, ctor, newRead);
}
function newRead<C extends EcsComponent>(ctor: Ctor<C>): Read<C> {
  return {
    inspect() {
      return inspectable(Read, inspectableNames([ctor]));
    },
    includes(archetype) {
      return archetype.has(ctor);
    },
    newQuery() {
      return {
        fetch({ archetype }) {
          return archetype.get(ctor)! as C;
        },
      };
    },
  };
}

/** Include a single-valued component in the query results. */
export function Value<C extends ValueComponent>(
  ctor: Ctor<C>,
): ValueDescriptor<C> {
  const cache = ValueDescriptors as WeakMap<Ctor<C>, ValueDescriptor<C>>;
  return getOrAdd(cache, ctor, newValue);
}
function newValue<C extends ValueComponent>(ctor: Ctor<C>): ValueDescriptor<C> {
  return {
    inspect() {
      return inspectable(Value, inspectableNames([ctor]));
    },
    includes(archetype) {
      return archetype.has(ctor);
    },
    newQuery() {
      return {
        fetch({ archetype }) {
          const entry = archetype.get(ctor)! as C;
          return entry.value as Value<C>;
        },
      };
    },
  };
}
