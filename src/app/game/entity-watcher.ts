import { PropertyBag } from "@/_interfaces";
import { isReactive, watch, WatchStopHandle } from "vue";

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

  unwatch(entity: StatefulEntity): void {
    const handle = this.handles.get(entity.id);
    if (handle) {
      handle();
      this.handles.delete(entity.id);
    }
  }

  flush(handler: (changes: Map<string, PropertyBag>) => void): void {
    if (this.dirty.size > 0) {
      handler(this.dirty);
      this.dirty.clear();
    }
  }
}
