import { EcsEntity, inspectable } from "@/app/ecs";

import { QueryDescriptor } from "../types";

type EntityQuery = QueryDescriptor<Readonly<EcsEntity>>;

const Descriptor: EntityQuery = {
  inspect() {
    return inspectable(Entity);
  },
  newQuery() {
    return {
      fetch({ entity }) {
        return entity;
      },
    };
  },
};

/** Include the entity object in the query results. */
export function Entity(): EntityQuery {
  return Descriptor;
}
