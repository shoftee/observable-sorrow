import { memoizer } from "@/app/utils/collections/memo";
import { Constructor as Ctor } from "@/app/utils/types";

import {
  EcsComponent,
  inspectableNames,
  inspectable,
  ValueComponent,
} from "@/app/ecs";

import { QueryDescriptor } from "../types";

type Read<C extends EcsComponent> = QueryDescriptor<Readonly<C>>;
type ExtractValue<C extends EcsComponent> = C extends ValueComponent<infer T>
  ? Readonly<T>
  : never;
type Value<C extends ValueComponent> = QueryDescriptor<ExtractValue<C>>;

const ReadMemo = memoizer<Ctor<EcsComponent>, Read<EcsComponent>>();
const ValueMemo = memoizer<Ctor<ValueComponent>, Value<ValueComponent>>();

/** Include a read-only view of a component in the query results. */
export function Read<C extends EcsComponent>(ctor: Ctor<C>) {
  return ReadMemo.get(ctor, newRead) as Read<C>;
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
export function Value<C extends ValueComponent>(ctor: Ctor<C>): Value<C> {
  return ValueMemo.get(ctor, newValue) as Value<C>;
}
function newValue<C extends ValueComponent>(ctor: Ctor<C>): Value<C> {
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
          return entry.value as ExtractValue<C>;
        },
      };
    },
  };
}
