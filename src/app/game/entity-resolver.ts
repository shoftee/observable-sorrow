import { Constructor } from "../core";
import { IEntity } from "../ecs";

type EntityMap = { [id: string]: IEntity };

export class EntityResolver {
  private readonly entities: EntityMap;

  constructor(entities: EntityMap) {
    this.entities = entities;
  }

  get<TEntity extends IEntity>(
    id: string,
    constr: Constructor<TEntity>,
  ): TEntity {
    const entity = this.entities[id];
    if (entity instanceof constr) {
      return entity;
    }

    console.log(entity);
    throw new Error(`Expected entity '${id}' to have type '${constr.name}'.`);
  }
}
