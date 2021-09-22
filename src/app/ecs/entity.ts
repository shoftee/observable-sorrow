import { ComponentPool, IComponent } from ".";
import { EntityAdmin } from "../game/entity-admin";
import { ChangeTracker } from "./common";

export abstract class Entity {
  readonly components: ComponentPool;

  constructor(protected readonly admin: EntityAdmin, readonly id: string) {
    this.components = new ComponentPool(this);
  }

  abstract init(): void;

  protected addComponent<T extends IComponent>(value: T): T {
    return this.components.add(value);
  }
}

export abstract class SimpleEntity extends Entity {
  abstract update(dt: number): void;
}

export abstract class ChangeTrackedEntity<TState> extends Entity {
  readonly changes = this.addComponent(new ChangeTracker<TState>());
}

type State = Record<string, unknown>;
export function CreateChangeTrackingProxy<TState extends State>(
  state: TState,
  notifier: ChangeTracker<TState>,
): TState {
  return new Proxy<TState>(state, {
    set: (target, property, value, receiver) => {
      const oldValue = Reflect.get(target, property, receiver);
      if (oldValue !== value) {
        if (!Reflect.set(target, property, value, receiver)) {
          return false;
        }
        notifier.mark(property as keyof TState);
      }

      return true;
    },
  });
}
