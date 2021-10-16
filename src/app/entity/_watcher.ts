import { isReactive, toRaw, watch, WatchStopHandle } from "vue";

import { PropertyBag, OnTickedHandler, ChangesBag } from "../game/endpoint";

import { EntityId } from ".";

export interface Watcher {
  watch(id: EntityId, state: unknown): void;
  unwatch(id: EntityId): void;
}

export class EntityWatcher implements Watcher {
  private readonly handles = new Map<EntityId, WatchStopHandle>();

  private readonly added = new Map<EntityId, PropertyBag>();
  private readonly updated = new Map<EntityId, PropertyBag>();
  private readonly removed = new Set<EntityId>();

  watch(id: EntityId, state: unknown): void {
    if (!isReactive(state)) {
      throw new Error(`attempted to watch non-reactive state '${id}'`);
    }

    this.added.set(id, state as PropertyBag);

    const handle = watch(
      () => state as PropertyBag,
      (newValue) => this.updated.set(id, newValue),
      { deep: true, flush: "sync", immediate: true },
    );

    this.handles.set(id, handle);
  }

  unwatch(id: EntityId): void {
    const handle = this.handles.get(id);
    if (handle) {
      handle();
      this.handles.delete(id);
    }

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

  flush(handler: OnTickedHandler): void {
    handler(this.collectChanges());
  }

  private collectChanges(): ChangesBag {
    const changes = {
      added: new Map<EntityId, PropertyBag>(),
      updated: new Map<EntityId, PropertyBag>(),
      removed: new Set<EntityId>(),
    };

    for (const [id, entry] of this.added) {
      changes.added.set(id, toRaw(entry));
    }
    this.added.clear();

    for (const id of this.removed) {
      changes.removed.add(id);
    }
    this.removed.clear();

    for (const [id, entry] of this.updated) {
      if (!changes.added.has(id) && !changes.removed.has(id)) {
        changes.updated.set(id, toRaw(entry));
      }
    }
    this.updated.clear();

    return changes;
  }
}
