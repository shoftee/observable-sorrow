import { customRef, watchSyncEffect } from "vue";

export class Channel<T> {
  private readonly items: T[] = [];
  private readonly trigger = customRef<boolean>((track, trigger) => {
    let v = false;
    return {
      get() {
        track();
        return v;
      },
      set(value: boolean) {
        v = value;
        if (v) {
          // only trigger reactivity when set to true.
          trigger();
        }
      },
    };
  });

  constructor() {
    this.trigger.value = false;
  }

  push(items: Iterable<T>): void {
    for (const item of items) {
      this.items.push(item);
    }

    this.trigger.value = true;
  }

  private *pull(): Iterable<T> {
    const items = this.items.splice(0);
    this.trigger.value = false;

    for (const item of items) {
      yield item;
    }
  }

  subscribe(handler: (items: Iterable<T>) => void): StopHandle {
    return watchSyncEffect(() => {
      if (this.trigger.value) {
        handler(this.pull());
      }
    });
  }
}

type StopHandle = () => void;
