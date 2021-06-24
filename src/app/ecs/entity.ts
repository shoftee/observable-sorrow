import { ComponentPool, IComponent } from ".";
import { EntityAdmin } from "../game/entity-admin";

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
