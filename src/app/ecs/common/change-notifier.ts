import { Component } from "..";

export class ChangeTrackedComponent<
  TState,
  K extends keyof TState = keyof TState,
> extends Component {
  private marked = new Set<K>();

  mark(...keys: K[]): void {
    for (const key of keys) {
      this.marked.add(key);
    }
  }

  apply(handler: (key: K) => void): void {
    for (const key of this.marked) {
      handler(key);
    }
  }

  clear(): void {
    this.marked.clear();
  }

  hasChanges(): boolean {
    return this.marked.size > 0;
  }
}
