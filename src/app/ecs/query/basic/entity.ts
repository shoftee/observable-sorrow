import { EcsEntity } from "@/app/ecs";
import { QueryDescriptor } from "../types";

type EntityQuery = QueryDescriptor<Readonly<EcsEntity>>;

/** Include the entity object in the query results. */
export function Entity(): EntityQuery {
  return {
    newQuery() {
      return {
        includes(): boolean {
          return true;
        },
        fetch(entity: EcsEntity): Readonly<EcsEntity> {
          return entity;
        },
      };
    },
  };
}
