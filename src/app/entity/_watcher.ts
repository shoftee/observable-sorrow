import { isReactive, toRaw, watch, WatchStopHandle } from "vue";

import { PropertyBag, OnTickedHandler } from "@/_interfaces";
import { asEnumerable } from "@/_utils/enumerable";

import { Entity, EntityId } from ".";

export class EntityWatcher {
  private readonly handles = new Map<EntityId, WatchStopHandle>();
  private readonly dirty = new Map<EntityId, PropertyBag>();

  watch<TEntity extends Entity>(entity: TEntity): TEntity {
    if (!entity.acceptWatcher) {
      // ignore entities that have no accept method
      return entity;
    }

    entity.acceptWatcher((id: EntityId, state: unknown) => {
      if (!isReactive(state)) {
        throw new Error(`attempted to watch non-reactive state '${id}'`);
      }

      const handle = watch(
        () => state as PropertyBag,
        (newValue: PropertyBag) => {
          this.dirty.set(id, newValue);
        },
        {
          deep: true,
          flush: "sync",
          immediate: true,
        },
      );

      this.handles.set(id, handle);
    });

    return entity;
  }

  unwatch(id: EntityId): void {
    const handle = this.handles.get(id);
    if (handle) {
      handle();
      this.handles.delete(id);
    }
  }

  flush(handler: OnTickedHandler): void {
    if (this.dirty.size > 0) {
      const raw = new Map<EntityId, PropertyBag>(
        asEnumerable(this.dirty).map(([k, v]) => [k, toRaw(v)]),
      );
      handler(raw);
      this.dirty.clear();
    }
  }
}
