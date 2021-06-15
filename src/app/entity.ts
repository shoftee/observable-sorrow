import { asEnumerable } from "linq-es2015";
import { reactive, Ref, unref } from "vue";

export interface IEntity<TId> {
    readonly id: TId;
}

export interface IEntityRefCollection<TId, TEntity extends IEntity<TId>> {
    all(): Ref<TEntity>[];
    get(id: TId): Ref<TEntity>;
}

class EntityRefCollection<TId, TEntity extends IEntity<TId>> implements IEntityRefCollection<TId, TEntity> {
    private readonly refCache = new Map<TId, Ref<TEntity>>();
    private readonly refs: Ref<TEntity>[];

    constructor(items: Iterable<TEntity>) {
        this.refs = asEnumerable(items).Select(e => reactive<TEntity>(e)).Cast<Ref<TEntity>>().ToArray();
        this.refCache = asEnumerable(this.refs).ToMap(e => unref(e).id, e => e);
    }

    all(): Ref<TEntity>[] {
        return this.refs;
    }

    get(id: TId): Ref<TEntity> {
        // eslint-disable-next-line
        return this.refCache.get(id)!;
    }
}

export default EntityRefCollection;