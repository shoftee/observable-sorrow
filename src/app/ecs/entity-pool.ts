import { asEnumerable } from "linq-es2015";
import { IEntity, ComponentPool } from ".";

export abstract class EntityPool<TId extends string, TEntity extends IEntity>
  implements IEntity
{
  abstract readonly id: string;

  private readonly pool: Map<TId, TEntity>;
  readonly components: ComponentPool;

  constructor() {
    this.pool = new Map<TId, TEntity>();
    this.components = new ComponentPool(this);
  }

  get(id: TId): TEntity | undefined {
    return this.pool.get(id);
  }

  protected set(id: TId, entity: TEntity) {
    this.pool.set(id, entity);
  }

  protected delete(id: TId) {
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
