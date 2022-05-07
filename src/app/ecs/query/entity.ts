import { WorldQuery } from ".";
import { EcsEntity } from "../world";

class EntityQuery implements WorldQuery<Readonly<EcsEntity>> {
  match(): boolean {
    return true;
  }

  fetch(entity: EcsEntity): Readonly<EcsEntity> {
    return entity;
  }
}

/** Include the entity object in the query results. */
export function Entity(): EntityQuery {
  return new EntityQuery();
}
