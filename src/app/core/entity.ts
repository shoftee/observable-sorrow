import { asEnumerable } from "linq-es2015";
import { reactive, Ref, unref } from "vue";

export interface IEntityState<TId> {
    readonly id: TId;
}

export interface IEntityMetadata<TId> {
    readonly id: TId;
}

export class EntityMetadataCache<TId, TEntityMetadata extends IEntityMetadata<TId>> {
    private readonly cache: Map<TId, TEntityMetadata>;

    constructor(items: Iterable<TEntityMetadata>) {
        this.cache = asEnumerable(items).ToMap(e => e.id, e => e);
    }
}

export class EntityStateMap<TId, TEntityState extends IEntityState<TId>> {
    private readonly refCache = new Map<TId, Ref<TEntityState>>();
    private readonly refs: Ref<TEntityState>[];

    constructor(items: Iterable<TEntityState>) {
        this.refs = asEnumerable(items).Select(e => reactive<TEntityState>(e)).Cast<Ref<TEntityState>>().ToArray();
        this.refCache = asEnumerable(this.refs).ToMap(e => unref(e).id, e => e);
    }

    all(): Ref<TEntityState>[] {
        return this.refs;
    }

    get(id: TId): Ref<TEntityState> {
        // eslint-disable-next-line
        return this.refCache.get(id)!;
    }
}