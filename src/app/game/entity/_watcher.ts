import { isReactive, toRaw, watch, WatchStopHandle } from "vue";

import {
  EntityId,
  OnEventHandler,
  OnMutationHandler as OnMutationHandler,
  PoolId,
  PropertyBag,
  MutationPool,
  EventId,
  EventPool,
} from "@/app/interfaces";

export interface Watcher {
  watch(id: EntityId, state: unknown): void;
  unwatch(id: EntityId): void;
}

export interface Buffer {
  push(state: unknown): void;
}

export class EntityWatcher {
  private readonly handles = new Map<EntityId, WatchStopHandle>();
  private readonly singletons = new WatchedPool("singletons");
  private readonly pools = new Map<PoolId, WatchedPool>();
  private readonly buffers = new Map<EventId, EventBuffer>();

  pooled(poolId: PoolId = "singletons"): Watcher {
    let pool = this.pools.get(poolId);
    if (pool === undefined) {
      pool = new WatchedPool(poolId);
      this.pools.set(poolId, pool);
    }

    return this.watcher(pool);
  }

  private watcher(pool: WatchedPool): Watcher {
    return {
      watch: (id, state) => this.watchIn(pool, id, state as PropertyBag),
      unwatch: (id) => this.unwatchIn(pool, id),
    };
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

  buffered(id: EventId): Buffer {
    let buffer = this.buffers.get(id);
    if (buffer === undefined) {
      buffer = new EventBuffer(id);
      this.buffers.set(id, buffer);
    }

    return this.wrapBuffer(buffer);
  }

  private wrapBuffer(buffer: EventBuffer): Buffer {
    return {
      push: (state) => buffer.items.push(state as PropertyBag),
    };
  }

  flushMutations(handler: OnMutationHandler): void {
    const mutationPools = this.changedPools();

    handler(mutationPools.map((m) => m.toMutationPool()));

    for (const pool of mutationPools) {
      pool.clear();
    }
  }

  flushEvents(handler: OnEventHandler): void {
    const buffers = this.pendingBuffers();

    handler(buffers.map((b) => b.toEventPool()));

    for (const buffer of buffers) {
      buffer.clear();
    }
  }

  private changedPools(): WatchedPool[] {
    const pools = [];
    if (this.singletons.hasChanges()) {
      pools.push(this.singletons);
    }

    for (const pool of this.pools.values()) {
      if (pool.hasChanges()) {
        pools.push(pool);
      }
    }

    return pools;
  }

  private pendingBuffers(): EventBuffer[] {
    const pools = [];
    for (const pool of this.buffers.values()) {
      if (pool.items.length > 0) {
        pools.push(pool);
      }
    }

    return pools;
  }
}

class WatchedPool {
  readonly added = new Map<EntityId, PropertyBag>();
  readonly updated = new Map<EntityId, PropertyBag>();
  readonly removed = new Set<EntityId>();

  constructor(readonly poolId: PoolId) {}

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

  toMutationPool(): MutationPool {
    const result: MutationPool = { poolId: this.poolId };
    if (this.added.size > 0) result.added = this.added;
    if (this.updated.size > 0) result.updated = this.updated;
    if (this.removed.size > 0) result.removed = this.removed;
    return result;
  }
}

class EventBuffer {
  readonly items: PropertyBag[];

  constructor(readonly id: EventId) {
    this.items = [];
  }

  toEventPool(): EventPool {
    return { id: this.id, events: this.items };
  }

  clear() {
    this.items.length = 0;
  }
}
