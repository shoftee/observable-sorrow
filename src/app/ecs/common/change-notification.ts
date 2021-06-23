import { ComponentState, IComponent } from "..";
import { QueueComponent } from "./queue";

export class ChangeNotifierComponent<
  TState,
  K extends keyof TState = keyof TState,
> extends QueueComponent<K> {
  notify(...keys: K[]): void {
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
}

export function setAndNotify<
  TComponent extends IComponent,
  TState extends ComponentState<TComponent>,
  K extends keyof TState,
>(
  state: TState,
  notifier: ChangeNotifierComponent<TState>,
  key: K,
  value: TState[K],
): void {
  if (state[key] != value) {
    state[key] = value;
    notifier.notify(key);
  }
}
