import { QueryDescriptor } from ".";
import { EcsEntity as Etty } from "../world";

type EntityQuery = QueryDescriptor<Readonly<Etty>>;

/** Include the entity object in the query results. */
export function Entity(): EntityQuery {
  return {
    newQuery() {
      return {
        includes(): boolean {
          return true;
        },
        fetch(entity: Etty): Readonly<Etty> {
          return entity;
        },
      };
    },
  };
}
