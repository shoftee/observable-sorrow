import { ComponentPool, IComponent } from "./component";
import { IInit, IUpdate } from "./lifecycle";

export interface IEntity {
  readonly id: string;
}

export abstract class Entity implements IEntity, IInit, IUpdate {
  abstract readonly id: string;
  abstract init(): void;
  abstract update(deltaTime: number): void;

  readonly components: ComponentPool;

  constructor() {
    this.components = new ComponentPool(this);
  }

  protected addComponent<T extends IComponent>(value: T): T {
    return this.components.add(value);
  }
}
