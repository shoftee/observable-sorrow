import { reactive } from "vue";

import { EntityId, PoolEntityId, Watcher } from "..";

export abstract class Entity<TId = EntityId> {
  constructor(readonly id: TId) {}

  watch?(watcher: Watcher): void;
}

export abstract class EntityPool<
  TId extends EntityId,
  TEntity extends Entity<TId>,
> extends Entity {
  private readonly ids: TId[];
  private readonly pool: Map<TId, TEntity>;

  constructor(readonly id: PoolEntityId, private readonly watcher: Watcher) {
    super(id);

    this.ids = reactive([]);
    watcher.watch(this.id, this.ids);

    this.pool = new Map<TId, TEntity>();
  }

  add(entity: TEntity): void {
    if (this.ids.includes(entity.id)) {
      throw new Error(
        `An entity with the name '${entity.id}' is already registered.`,
      );
    }

    this.ids.push(entity.id);
    this.pool.set(entity.id, entity);
    entity.watch?.(this.watcher);
  }

  remove(id: TId): void {
    if (!this.ids.includes(id)) {
      throw new Error(`There is no registered entity with the ID '${id}'.`);
    }

    const index = this.ids.indexOf(id);
    this.ids.splice(index, 1);
    this.pool.delete(id);
    this.watcher.unwatch(id);
  }

  removeLast(): void {
    if (this.ids.length === 0) {
      throw new Error("There are no entities in the pool.");
    }

    const [id] = this.ids.splice(this.ids.length - 1, 1);
    this.pool.delete(id);
    this.watcher.unwatch(id);
  }

  get(id: TId): TEntity {
    const entity = this.pool.get(id);
    if (entity === undefined) {
      throw new Error(`There is no registered entity with the ID '${id}'.`);
    }
    return entity;
  }

  *all(): Iterable<TEntity> {
    for (const entity of this.pool.values()) {
      yield entity;
    }
  }

  get size(): number {
    return this.pool.size;
  }
}
