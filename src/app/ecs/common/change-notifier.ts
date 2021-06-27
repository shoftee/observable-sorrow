import { QueueComponent } from "./queue";

export class ChangeNotifierComponent<
  TState,
  K extends keyof TState = keyof TState,
> extends QueueComponent<K> {
  mark(...keys: K[]): void {
    for (const key of keys) {
      this.enqueue(key);
    }
  }

  apply(handler: (key: K) => void): void {
    const keys = new Set<K>();
    this.consume((key) => {
      if (!keys.has(key)) {
        handler(key);
        keys.add(key);
      }
    });
  }

  hasChanges(): boolean {
    return this.length > 0;
  }
}
