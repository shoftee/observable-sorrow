import { asEnumerable } from "linq-es2015";
import { ComponentPool, Entity } from ".";

export abstract class EntityPool<
  TId extends string,
  TEntity extends Entity,
> extends Entity {
  private readonly pool: Map<TId, TEntity>;
  readonly components: ComponentPool;

  constructor() {
    super();

    this.pool = new Map<TId, TEntity>();
    this.components = new ComponentPool(this);
  }

  get(id: TId): TEntity {
    const resource = this.pool.get(id);
    if (!resource) {
      throw new Error(`Resource entity with id '${id}' not found.`);
    }
    return resource;
  }

  protected set(id: TId, entity: TEntity): void {
    this.pool.set(id, entity);
  }

  protected delete(id: TId): void {
    this.pool.delete(id);
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
