import { isReactive, toRaw, watch, WatchStopHandle } from "vue";

import { PropertyBag, OnTickedHandler } from "@/_interfaces";

interface StatefulEntity {
  id: string;
  state?: PropertyBag;
}

export class EntityWatcher {
  private readonly handles = new Map<string, WatchStopHandle>();
  private readonly dirty = new Map<string, PropertyBag>();

  watch(entity: StatefulEntity): void {
    if (entity.state) {
      if (!isReactive(entity.state)) {
        throw new Error(`attempted to watch non-reactive state '${entity.id}'`);
      }

      const handle = watch(
        () => entity.state,
        (newValue: PropertyBag) => {
          this.dirty.set(entity.id, newValue);
        },
        {
          deep: true,
          flush: "sync",
          immediate: true,
        },
      );

      this.handles.set(entity.id, handle);
    }
  }

  unwatch(id: string): void {
    const handle = this.handles.get(id);
    if (handle) {
      handle();
      this.handles.delete(id);
    }
  }

  flush(handler: OnTickedHandler): void {
    if (this.dirty.size > 0) {
      handler(this.collectDirty());
      this.dirty.clear();
    }
  }

  private collectDirty(): Map<string, PropertyBag> {
    const raw = new Map<string, PropertyBag>();
    for (const [key, value] of this.dirty.entries()) {
      raw.set(key, toRaw(value));
    }
    return raw;
  }
}
