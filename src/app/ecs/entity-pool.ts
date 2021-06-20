import { ref, Ref, ComputedRef } from "vue";
import { IEntity, ComponentPool } from ".";
import { valuesRef } from "../_reactive";

export abstract class EntityPool<TId extends string, TEntity extends IEntity>
  implements IEntity
{
  abstract readonly id: string;

  private readonly pool: Map<TId, TEntity>;
  private readonly poolRef: Ref<Map<TId, TEntity>>;
  readonly components: ComponentPool;

  constructor() {
    this.pool = new Map<TId, TEntity>();
    this.poolRef = ref(this.pool) as Ref<Map<TId, TEntity>>;
    this.components = new ComponentPool(this);
  }

  get(id: TId): TEntity | undefined {
    return this.pool.get(id);
  }

  all(): ComputedRef<Iterable<TEntity>> {
    return valuesRef(this.poolRef);
  }
}
