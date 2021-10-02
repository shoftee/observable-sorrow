import { Constructor } from "@/_interfaces";

import { Entity } from "./entity";
import { IComponent } from "./component";

type FindComponentResult = { component: IComponent; index: number };

export class ComponentPool implements Iterable<IComponent> {
  private pool: IComponent[] = [];

  constructor(readonly owner: Entity) {}

  [Symbol.iterator](): Iterator<IComponent> {
    return this.pool.values();
  }

  public all(): IComponent[] {
    return this.pool;
  }

  public add<T extends IComponent>(component: T): T {
    this.pool.push(component);
    component.owner = this.owner;
    return component;
  }

  public get<T extends IComponent>(constr: Constructor<T>): T | undefined {
    for (const component of this.pool) {
      if (component instanceof constr) {
        return component as T;
      }
    }

    return undefined;
  }

  public remove<T extends IComponent>(constr: Constructor<T>): void {
    const result = this.find<T>(constr);
    if (result) {
      result.component.owner = undefined;
      this.pool.splice(result.index, 1);
    }
  }

  public find<T extends IComponent>(
    constr: Constructor<T>,
  ): FindComponentResult | undefined {
    for (let index = 0; index < this.pool.length; index++) {
      const component = this.pool[index];
      if (component instanceof constr) {
        return { component, index };
      }
    }

    return undefined;
  }

  public contains<T extends IComponent>(constr: Constructor<T>): boolean {
    for (const component of this.pool) {
      if (component instanceof constr) {
        return true;
      }
    }

    return false;
  }
}
