import { asEnumerable } from "linq-es2015";
import { IEntity, ComponentPool } from ".";
import { QueueComponent } from "./common/queue-component";

export abstract class EntityPool<TId extends string, TEntity extends IEntity>
  implements IEntity
{
  abstract readonly id: string;

  private readonly pool: Map<TId, TEntity>;
  readonly components: ComponentPool;

  readonly changes: PoolChangedComponent<TId>;

  constructor() {
    this.pool = new Map<TId, TEntity>();
    this.components = new ComponentPool(this);

    this.changes = this.components.add(new PoolChangedComponent<TId>());
  }

  get(id: TId): TEntity | undefined {
    return this.pool.get(id);
  }

  protected set(id: TId, entity: TEntity): void {
    const update = this.pool.has(id);
    this.pool.set(id, entity);
    if (!update) {
      this.changes.enqueue({ type: "add", id: id });
    }
  }

  protected delete(id: TId): void {
    const removed = this.pool.delete(id);
    if (removed) {
      this.changes.enqueue({ type: "delete", id: id });
    }
  }

  all(predicate?: (e: TEntity) => boolean): Iterable<TEntity> {
    const values = this.pool.values();
    if (predicate) {
      return asEnumerable(values).Where(predicate);
    } else {
      return values;
    }
  }
}

export type SetChange<TId extends string> = {
  type: "add" | "delete";
  id: TId;
};

export class PoolChangedComponent<TId extends string> extends QueueComponent<
  SetChange<TId>
> {
  applyChanges(handler: ApplyChangesHandler<TId>): void {
    this.consume((item) => {
      switch (item.type) {
        case "add":
          handler.add(item.id);
          break;
        case "delete":
          handler.delete(item.id);
          break;
      }
    });
  }
}

type ApplyChangesHandler<TId extends string> = {
  add: (id: TId) => void;
  delete: (id: TId) => void;
};
