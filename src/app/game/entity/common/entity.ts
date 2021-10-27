import { reactive } from "vue";

import { EntityId, PoolId } from "@/app/interfaces";
import { SaveState } from "@/app/store";
import { asEnumerable, Enumerable } from "@/app/utils/enumerable";

import { Watcher } from "..";

export interface Watched {
  watch(watcher: Watcher): void;
}

export interface Persisted {
  loadState(state: SaveState): void;
  saveState(state: SaveState): void;
}

export abstract class Entity<TId extends EntityId> {
  constructor(readonly id: TId) {}
}

export abstract class ValueEntity<
  TId extends EntityId,
  TState,
> extends Entity<TId> {
  readonly state: { value: TState | undefined };

  constructor(readonly id: TId) {
    super(id);

    this.state = reactive({ value: undefined });
  }

  watch(watcher: Watcher): void {
    watcher.watch(this.id, this.state);
  }

  get(): TState | undefined {
    return this.state.value;
  }

  set(value: TState | undefined): void {
    this.state.value = value;
  }
}

export abstract class EntityPool<
  TId extends EntityId,
  TEntity extends Entity<TId> & Partial<Watched>,
> {
  protected readonly pool: Map<TId, TEntity>;

  constructor(readonly id: PoolId, private readonly watcher: Watcher) {
    this.pool = new Map<TId, TEntity>();
  }

  protected add(entity: TEntity): void {
    this.pool.set(entity.id, entity);
    entity.watch?.(this.watcher);
  }

  protected remove(id: TId): void {
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

  enumerate(): Enumerable<TEntity> {
    return asEnumerable(this.pool.values());
  }

  get size(): number {
    return this.pool.size;
  }
}
