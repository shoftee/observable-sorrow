import { Constructor as Ctor } from "@/app/utils/types";

import { Archetype, EcsComponent, EcsEntity } from "../world";
import { InstantiatedQuery, QueryDescriptor } from "./types";

type Read<C extends EcsComponent> = QueryDescriptor<Readonly<C>>;

/** Include a read-only view of a component in the query results. */
export function Read<C extends EcsComponent>(ctor: Ctor<C>): Read<C> {
  return {
    newQuery(): InstantiatedQuery<Readonly<C>> {
      return {
        match: (archetype: Archetype) => {
          return archetype.has(ctor);
        },
        fetch: (_: EcsEntity, archetype: Archetype<C>) => {
          return archetype.get(ctor)!;
        },
      };
    },
  };
}
