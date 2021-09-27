import { Component } from "..";

export class ChangeTracker<
  TState,
  K extends keyof TState = keyof TState,
> extends Component {
  private marked = new Set<K>();

  mark(...keys: K[]): void {
    for (const key of keys) {
      this.marked.add(key);
    }
  }

  handle(handlers: Partial<Record<K, () => void>>): void {
    for (const key of this.marked) {
      const fn = handlers[key];
      if (fn) {
        fn();
      }
    }
  }

  handleAny(keys: K[], handler: () => void): void {
    for (const key of keys) {
      if (this.marked.has(key)) {
        handler();
        break;
      }
    }
  }

  has(key: K): boolean {
    return this.marked.has(key);
  }

  clear(): void {
    this.marked.clear();
  }

  hasChanges(): boolean {
    return this.marked.size > 0;
  }
}
