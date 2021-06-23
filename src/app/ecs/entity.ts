import { IUpdate, ComponentPool, IComponent } from ".";

export abstract class Entity implements IUpdate {
  readonly components: ComponentPool;

  constructor() {
    this.components = new ComponentPool(this);
  }

  abstract update(dt: number): void;

  protected addComponent<T extends IComponent>(value: T): T {
    return this.components.add(value);
  }
}
