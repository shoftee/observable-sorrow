import { reactive } from "vue";
import { EntityId, EntityWatcher, PooledEntityId } from "..";

export type Watch = (id: EntityId, state: unknown) => void;

export abstract class Entity<TId = EntityId> {
  constructor(readonly id: TId) {}

  acceptWatcher?(watcher: Watch): void;
}

export abstract class EntityPool<
  TId extends EntityId,
  TEntity extends Entity<TId>,
> extends Entity {
  private readonly ids: Set<TId>;
  private readonly pool: Map<TId, TEntity>;

  constructor(
    readonly id: PooledEntityId,
    private readonly watcher: EntityWatcher,
  ) {
    super(id);

    this.ids = reactive(new Set<TId>());
    this.pool = new Map<TId, TEntity>();
  }

  acceptWatcher(watch: Watch): void {
    watch(this.id, this.ids);
  }

  add(entity: TEntity): void {
    if (this.ids.has(entity.id)) {
      throw new Error(
        `An entity with the name '${entity.id}' is already registered.`,
      );
    }

    this.ids.add(entity.id);
    this.pool.set(entity.id, entity);
    this.watcher.watch(entity);
  }

  remove(id: TId): void {
    if (!this.ids.has(id)) {
      throw new Error(`There is no registered entity with the ID '${id}'.`);
    }

    this.ids.delete(id);
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
}
