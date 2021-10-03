import { Entity } from "@/_ecs";
import {
  BuildingId,
  Constructor,
  EffectId,
  RecipeId,
  ResourceId,
} from "@/_interfaces";

import {
  EntityId,
  RecipeEntity,
  ResourceEntity,
  BuildingEntity,
  EnvironmentEntity,
  EntityWatcher,
  TimersEntity,
  EffectEntity,
} from ".";

export class EntityAdmin {
  private readonly pool = new Map<EntityId, Entity>();

  constructor(private readonly watcher: EntityWatcher) {}

  add<TEntity extends Entity>(entity: TEntity): void {
    if (this.pool.has(entity.id as EntityId)) {
      throw new Error(
        `An entity with the name '${entity.id}' is already registered.`,
      );
    }

    this.pool.set(entity.id as EntityId, entity);
    this.watcher.watch(entity);
  }

  remove(id: EntityId): void {
    if (!this.pool.has(id)) {
      throw new Error(`There is no registered entity with the ID '${id}'.`);
    }

    this.pool.delete(id);
    this.watcher.unwatch(id);
  }

  protected entity<E extends Entity>(
    id: EntityId,
    constructor: Constructor<E>,
  ): E {
    const entity = this.pool.get(id);
    if (entity === undefined) {
      throw new Error(`There is no registered entity with the id '${id}'.`);
    }
    if (!(entity instanceof constructor)) {
      throw new Error(
        `Expected the entity with ID '${id}' to be of type '${constructor}' but it was '${Object.getPrototypeOf(
          entity,
        )}' instead.`,
      );
    } else {
      return entity;
    }
  }

  protected *entities<E extends Entity>(
    constructor: Constructor<E>,
  ): Iterable<E> {
    for (const entity of this.pool.values()) {
      if (entity instanceof constructor) {
        yield entity;
      }
    }
  }

  recipe(id: RecipeId): RecipeEntity {
    return this.entity<RecipeEntity>(id, RecipeEntity);
  }

  recipes(): Iterable<RecipeEntity> {
    return this.entities(RecipeEntity);
  }

  resource(id: ResourceId): ResourceEntity {
    return this.entity<ResourceEntity>(id, ResourceEntity);
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

  effect(id: EffectId): EffectEntity {
    return this.entity(id, EffectEntity);
  }

  effects(): Iterable<EffectEntity> {
    return this.entities(EffectEntity);
  }

  environment(): EnvironmentEntity {
    return this.entity("environment", EnvironmentEntity);
  }

  timers(): TimersEntity {
    return this.entity("timers", TimersEntity);
  }
}
