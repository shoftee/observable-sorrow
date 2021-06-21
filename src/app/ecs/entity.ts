import { IUpdate, ComponentPool, IComponent } from ".";

export interface IEntity {
  readonly id: string;
}

export abstract class Entity implements IEntity, IUpdate {
  abstract readonly id: string;

  readonly components: ComponentPool;

  constructor() {
    this.components = new ComponentPool(this);
  }

  abstract update(deltaTime: number): void;

  protected addComponent<T extends IComponent>(value: T): T {
    return this.components.add(value);
  }
}
