import { IEntity } from "./entity";

export interface IComponent {
  owner?: IEntity;
}

export type ComponentState<TComponent extends IComponent> = Omit<
  TComponent,
  keyof IComponent
>;

export abstract class Component implements IComponent {
  owner?: IEntity;
}

type Constructor<T> = { new (...args: unknown[]): T };

export class ComponentPool implements Iterable<IComponent> {
  private pool: IComponent[] = [];

  constructor(readonly owner: IEntity) {}

  [Symbol.iterator](): Iterator<IComponent> {
    return this.pool.values();
  }

  public all(): IComponent[] {
    return this.pool;
  }

  public add(component: IComponent): void {
    this.pool.push(component);
    component.owner = this.owner;
  }

  public get<C extends IComponent>(constr: Constructor<C>): C | undefined {
    for (const component of this.pool) {
      if (component instanceof constr) {
        return component as C;
      }
    }

    return undefined;
  }

  public remove<C extends IComponent>(constr: Constructor<C>): void {
    const result = this.find<C>(constr);
    if (result) {
      result.component.owner = undefined;
      this.pool.splice(result.index, 1);
    }
  }

  public find<C extends IComponent>(
    constr: Constructor<C>,
  ): FindComponentResult | undefined {
    for (let index = 0; index < this.pool.length; index++) {
      const component = this.pool[index];
      if (component instanceof constr) {
        return { component, index };
      }
    }

    return undefined;
  }

  public contains<C extends IComponent>(constr: Constructor<C>): boolean {
    for (const component of this.pool) {
      if (component instanceof constr) {
        return true;
      }
    }

    return false;
  }
}

type FindComponentResult = { component: IComponent; index: number };

export abstract class ComponentRefsPool {}
