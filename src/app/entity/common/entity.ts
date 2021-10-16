import { EntityId, PoolEntityId, Watcher } from "..";

export abstract class Entity<TId = EntityId> {
  constructor(readonly id: TId) {}

  watch?(watcher: Watcher): void;
}

export abstract class EntityPool<
  TId extends EntityId,
  TEntity extends Entity<TId>,
> extends Entity {
  private readonly pool: Map<TId, TEntity>;

  constructor(readonly id: PoolEntityId, private readonly watcher: Watcher) {
    super(id);

    this.pool = new Map<TId, TEntity>();
  }

  add(entity: TEntity): void {
    this.pool.set(entity.id, entity);
    entity.watch?.(this.watcher);
  }

  remove(id: TId): void {
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
