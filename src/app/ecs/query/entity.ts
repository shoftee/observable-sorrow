import { WorldQuery } from ".";
import { Entity as Etty } from "../world";

class EntityQuery implements WorldQuery<Readonly<Etty>> {
  match(): boolean {
    return true;
  }

  fetch(entity: Etty): Readonly<Etty> {
    return entity;
  }
}

/** Include the entity object in the query results. */
export function Entity(): EntityQuery {
  return new EntityQuery();
}
