import { EcsEntity } from "@/app/ecs";

import { defaultQuery, EntityQueryFactory } from "../types";

type EntityQuery = EntityQueryFactory<Readonly<EcsEntity>>;

/** Include the entity object in the query results. */
export function Entity(): EntityQuery {
  return {
    newQuery() {
      return defaultQuery({
        fetch({ entity }) {
          return entity;
        },
      });
    },
  };
}
