import { Constructor as Ctor } from "@/app/utils/types";

import { EcsComponent, ValueComponent } from "@/app/ecs";
import { defaultQuery, QueryDescriptor } from "../types";

type Read<C extends EcsComponent> = QueryDescriptor<Readonly<C>>;

/** Include a read-only view of a component in the query results. */
export function Read<C extends EcsComponent>(ctor: Ctor<C>): Read<C> {
  return {
    newQuery() {
      return defaultQuery({
        includes({ archetype }) {
          return archetype.has(ctor);
        },
        fetch({ archetype }) {
          return archetype.get(ctor)! as C;
        },
      });
    },
  };
}

type Value<C extends EcsComponent> = C extends ValueComponent<infer T>
  ? Readonly<T>
  : never;

/** Include a single-valued component in the query results. */
export function Value<C extends ValueComponent>(
  ctor: Ctor<C>,
): QueryDescriptor<Value<C>> {
  return {
    newQuery() {
      return defaultQuery({
        includes({ archetype }) {
          return archetype.has(ctor);
        },
        fetch({ archetype }) {
          const entry = archetype.get(ctor)! as C;
          return entry.value as Value<C>;
        },
      });
    },
  };
}
