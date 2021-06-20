import { markRaw } from "vue";
import { ComponentPool } from "./component";
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

    markRaw(this);
  }
}
