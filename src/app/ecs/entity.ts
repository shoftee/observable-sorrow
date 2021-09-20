import { ComponentPool, IComponent } from ".";
import { EntityAdmin } from "../game/entity-admin";
import { ChangeTrackedComponent } from "./common";

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

export abstract class ChangeTrackedEntity<TState> extends Entity {
  readonly notifier: ChangeTrackedComponent<TState>;

  constructor(admin: EntityAdmin, id: string) {
    super(admin, id);

    this.notifier = this.addComponent(new ChangeTrackedComponent<TState>());
  }
}

export abstract class SimpleEntity extends Entity {
  abstract update(dt: number): void;
}
