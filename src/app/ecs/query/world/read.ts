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
const ReadMemo = memoizer<Ctor<EcsComponent>, Read<EcsComponent>>();
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

function makeExtractor<C extends EcsComponent, V>(
  named: { name: string },
  ctor: Ctor<C>,
  selector: (component: C) => V,
): QueryDescriptor<V> {
  return {
    inspect() {
      return inspectable(named, inspectableNames([ctor]));
    },
    includes(archetype) {
      return archetype.has(ctor);
    },
    newQuery() {
      return {
        fetch({ archetype }) {
          return selector(archetype.get(ctor)! as C);
        },
      };
    },
  };
}

/** Select arbitrary data from the specified component. */
export function Extract<C extends EcsComponent>(ctor: Ctor<C>) {
  return <V>(selector: (c: C) => V): QueryDescriptor<V> => {
    return makeExtractor(Extract, ctor, selector);
  };
}

type Value<C extends ValueComponent> = QueryDescriptor<UnwrapValueComponent<C>>;
const ValueMemo = memoizer<Ctor<ValueComponent>, Value<ValueComponent>>();
/** Like `Extract`, but for `ValueComponent`s. */
export function Value<C extends ValueComponent>(ctor: Ctor<C>): Value<C> {
  return ValueMemo.get(ctor, newValue) as Value<C>;
}

type UnwrapValueComponent<C extends EcsComponent> = C extends ValueComponent<
  infer T
>
  ? Readonly<T>
  : never;
function newValue<C extends ValueComponent>(ctor: Ctor<C>): Value<C> {
  return makeExtractor(Value, ctor, (c) => c.value as UnwrapValueComponent<C>);
}
