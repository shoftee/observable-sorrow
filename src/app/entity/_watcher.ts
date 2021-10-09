import { isReactive, toRaw, watch, WatchStopHandle } from "vue";

import { PropertyBag, OnTickedHandler } from "@/_interfaces";
import { asEnumerable } from "@/_utils/enumerable";

interface StatefulEntity {
  id: string;
  state?: PropertyBag;
}

export class EntityWatcher {
  private readonly handles = new Map<string, WatchStopHandle>();
  private readonly dirty = new Map<string, PropertyBag>();

  watch(entity: StatefulEntity): void {
    if (!entity.state) {
      // ignore entities that are not stateful.
      return;
    }

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

  unwatch(id: string): void {
    const handle = this.handles.get(id);
    if (handle) {
      handle();
      this.handles.delete(id);
    }
  }

  flush(handler: OnTickedHandler): void {
    if (this.dirty.size > 0) {
      const raw = new Map<string, PropertyBag>(
        asEnumerable(this.dirty).map(([k, v]) => [k, toRaw(v)]),
      );
      handler(raw);
      this.dirty.clear();
    }
  }
}
