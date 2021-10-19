import { isReactive, toRaw, watch, WatchStopHandle } from "vue";

import {
  ChangePool,
  EntityId,
  OnTickedHandler,
  PoolEntityId,
  PropertyBag,
} from "@/app/interfaces";

export interface Watcher {
  watch(id: EntityId, state: unknown): void;
  unwatch(id: EntityId): void;
}

export class EntityWatcher implements Watcher {
  private readonly handles = new Map<EntityId, WatchStopHandle>();
  private readonly misc = new WatchedPool();
  private readonly pools = new Map<PoolEntityId, WatchedPool>();

  pooled(poolId: PoolEntityId): Watcher {
    let pool = this.pools.get(poolId);
    if (pool === undefined) {
      pool = new WatchedPool(poolId);
      this.pools.set(poolId, pool);
    }

    return this.createPooledWatcher(pool);
  }

  private createPooledWatcher(pool: WatchedPool): Watcher {
    return {
      watch: (id, state) => this.watchIn(pool, id, state as PropertyBag),
      unwatch: (id) => this.unwatchIn(pool, id),
    };
  }

  watch(id: EntityId, state: unknown): void {
    this.watchIn(this.misc, id, state as PropertyBag);
  }

  unwatch(id: EntityId): void {
    this.unwatchIn(this.misc, id);
  }

  private unwatchIn(pool: WatchedPool, id: EntityId) {
    const handle = this.handles.get(id);
    if (handle) {
      handle();
      this.handles.delete(id);
    }

    pool.remove(id);
  }

  private watchIn(pool: WatchedPool, id: EntityId, state: PropertyBag) {
    if (!isReactive(state)) {
      throw new Error(`attempted to watch non-reactive state '${id}'`);
    }

    pool.add(id, toRaw(state));

    const handle = watch(
      () => state,
      (newValue) => pool.update(id, toRaw(newValue)),
      { deep: true, flush: "sync" },
    );

    this.handles.set(id, handle);
  }

  flush(handler: OnTickedHandler): void {
    const changePools = Array.from(this.collectChanges(), (p) =>
      p.toChangePool(),
    );
    handler(changePools);
    for (const pool of this.collectChanges()) {
      pool.clear();
    }
  }

  private *collectChanges(): Iterable<WatchedPool> {
    if (this.misc.hasChanges()) {
      yield this.misc;
    }

    for (const [, pool] of this.pools) {
      if (pool.hasChanges()) {
        yield pool;
      }
    }
  }
}

class WatchedPool {
  readonly added = new Map<EntityId, PropertyBag>();
  readonly updated = new Map<EntityId, PropertyBag>();
  readonly removed = new Set<EntityId>();

  constructor(readonly poolId?: PoolEntityId) {}

  hasChanges(): boolean {
    return (
      this.added.size > 0 || this.updated.size > 0 || this.removed.size > 0
    );
  }

  clear() {
    this.added.clear();
    this.removed.clear();
    this.updated.clear();
  }

  add(id: EntityId, state: PropertyBag) {
    this.added.set(id, toRaw(state));
  }

  update(id: EntityId, state: PropertyBag) {
    if (this.added.has(id)) {
      this.added.set(id, toRaw(state));
    } else {
      this.updated.set(id, toRaw(state));
    }
  }

  remove(id: EntityId) {
    if (this.added.has(id)) {
      // no need to send a change, just remove entry
      this.added.delete(id);
      console.log(
        `Entity ${id} was added and then removed in the span of a single tick`,
      );
    } else {
      this.updated.delete(id);
      this.removed.add(id);
    }
  }

  toChangePool(): ChangePool {
    const result: ChangePool = { poolId: this.poolId };
    if (this.added.size > 0) result.added = this.added;
    if (this.updated.size > 0) result.updated = this.updated;
    if (this.removed.size > 0) result.removed = this.removed;
    return result;
  }
}
