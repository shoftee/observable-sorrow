import { Resolver } from "../core";
import { IInit, IUpdate, ComponentPool, IComponent } from ".";

export interface IEntity {
  readonly id: string;
}

export abstract class Entity implements IEntity, IInit, IUpdate {
  abstract readonly id: string;

  readonly components: ComponentPool;

  constructor() {
    this.components = new ComponentPool(this);
  }

  abstract init(resolver: Resolver<IEntity>): void;
  abstract update(deltaTime: number): void;

  protected addComponent<T extends IComponent>(value: T): T {
    return this.components.add(value);
  }
}
