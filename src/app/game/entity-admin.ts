import { Constructor } from "../core";
import { Entity } from "../ecs/entity";
import { BuildingId, ResourceId } from "../core/metadata";
import { ResourceEntity } from "../resources";
import { WorkshopEntity } from "../workshop";
import { BuildingEntity } from "../buildings/entity";
import { EnvironmentEntity } from "../environment";
import { TimersEntity } from "./timers";
import { EffectPoolEntity } from "../effects";

type EntityId =
  | ResourceId
  | BuildingId
  | "effects"
  | "environment"
  | "timers"
  | "workshop";

export class EntityAdmin {
  readonly pool = new Map<EntityId, Entity>();

  add<TEntity extends Entity>(entity: TEntity): void {
    if (this.pool.has(entity.id as EntityId)) {
      throw new Error(
        `An entity with the name '${entity.id}' is already registered.`,
      );
    }

    this.pool.set(entity.id as EntityId, entity);
  }

  remove(id: EntityId): void {
    if (!this.pool.has(id)) {
      throw new Error(`There is no registered entity with the ID '${id}'.`);
    }

    this.pool.delete(id);
  }

  resource(id: ResourceId): ResourceEntity {
    return this.entity(id, ResourceEntity);
  }

  resources(): Iterable<ResourceEntity> {
    return this.entities(ResourceEntity);
  }

  building(id: BuildingId): BuildingEntity {
    return this.entity(id, BuildingEntity);
  }

  buildings(): Iterable<BuildingEntity> {
    return this.entities(BuildingEntity);
  }

  effects(): EffectPoolEntity {
    return this.entity("effects", EffectPoolEntity);
  }

  workshop(): WorkshopEntity {
    return this.entity("workshop", WorkshopEntity);
  }

  environment(): EnvironmentEntity {
    return this.entity("environment", EnvironmentEntity);
  }

  timers(): TimersEntity {
    return this.entity("timers", TimersEntity);
  }

  private entity<E extends Entity>(
    id: EntityId,
    constructor: Constructor<E>,
  ): E {
    const entity = this.pool.get(id);
    if (entity === undefined) {
      throw new Error(`There is no registered entity with the id '${id}'.`);
    } else if (!(entity instanceof constructor)) {
      throw new Error(
        `Expected the entity with ID '${id}' to be of type '${constructor}' but it was '${Object.getPrototypeOf(
          entity,
        )}' instead.`,
      );
    } else {
      return entity;
    }
  }

  private *entities<E extends Entity>(
    constructor: Constructor<E>,
  ): Iterable<E> {
    for (const entity of this.pool.values()) {
      if (entity instanceof constructor) {
        yield entity;
      }
    }
  }
}
