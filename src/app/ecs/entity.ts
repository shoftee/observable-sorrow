import { ComponentPool, IComponent } from ".";

export abstract class Entity {
  readonly components: ComponentPool;

  constructor(readonly id: string) {
    this.components = new ComponentPool(this);
  }

  protected addComponent<T extends IComponent>(value: T): T {
    return this.components.add(value);
  }
}

export abstract class SimpleEntity extends Entity {
  abstract update(dt: number): void;
}
