import { cache } from "@/app/utils/cache";
import { single } from "@/app/utils/collections";

import { FetchCache } from "@/app/ecs/state";

import { EcsEntity, EcsMetadata, World, inspectable } from "@/app/ecs";

import {
  SystemParamDescriptor,
  QueryDescriptor,
  QueryTuple,
  OneOrMoreFilters,
  SystemParameter,
} from "../types";

import { Tuple, Entity, TupleQueryDescriptor as TupleQd } from "..";

abstract class QueryFactoryBase<Q extends [...QueryDescriptor[]], R>
  implements SystemParamDescriptor<R>
{
  constructor(protected descriptor: TupleQd<Q>) {}

  filter(...filters: OneOrMoreFilters) {
    this.descriptor = this.descriptor.filter(...filters);
    return this;
  }

  abstract inspect(): EcsMetadata;

  protected abstract getQueryResult(fetchCache: FetchCache<QueryTuple<Q>>): R;

  create(world: World): SystemParameter<R> {
    const { descriptor: factory } = this;
    world.queries.register(factory);
    const fetchCache = world.queries.get(factory);
    const fetcher = cache(() => this.getQueryResult(fetchCache));

    return {
      fetch() {
        return fetcher.retrieve();
      },
      cleanup() {
        fetcher.invalidate();
        fetchCache.cleanup();
      },
    };
  }
}

export type IterableQueryResult<Result> = {
  [Symbol.iterator](): IterableIterator<Result>;
};

class IterableQueryFactory<Q extends [...QueryDescriptor[]]>
  extends QueryFactoryBase<Q, IterableQueryResult<QueryTuple<Q>>>
  implements SystemParamDescriptor<IterableQueryResult<QueryTuple<Q>>>
{
  constructor(...wq: Q) {
    super(Tuple(...wq));
  }

  inspect() {
    return this.descriptor.inspect();
  }

  protected getQueryResult(fetchCache: FetchCache<QueryTuple<Q>>) {
    return Array.from(fetchCache.values());
  }
}

export function Query<Q extends [...QueryDescriptor[]]>(
  ...qs: Q
): IterableQueryFactory<Q> {
  return new IterableQueryFactory(...qs);
}

class SingleQueryFactory<Q extends [...QueryDescriptor[]]>
  extends QueryFactoryBase<Q, QueryTuple<Q>>
  implements SystemParamDescriptor<QueryTuple<Q>>
{
  constructor(...wq: Q) {
    super(Tuple(...wq));
  }

  inspect() {
    return inspectable(Single, this.descriptor.inspect().children);
  }

  protected getQueryResult(fetchCache: FetchCache<QueryTuple<Q>>) {
    return single(fetchCache.values());
  }
}

/** Like `Query(...)`, but only works if there's a single result from the query. If there are 0 or more than 1 results, an error is thrown during data retrieval. */
export function Single<Q extends [...QueryDescriptor[]]>(
  ...qs: Q
): SingleQueryFactory<Q> {
  return new SingleQueryFactory(...qs);
}

export type MapQueryResult<K, V> = {
  [Symbol.iterator](): IterableIterator<[Readonly<K>, V]>;
  entries(): IterableIterator<[Readonly<K>, V]>;
  keys(): IterableIterator<Readonly<K>>;
  values(): IterableIterator<V>;
  get(key: Readonly<K>): V | undefined;
  has(key: Readonly<K>): boolean;
};

class MapQueryFactory<K, V> extends QueryFactoryBase<
  [QueryDescriptor<Readonly<K>>, QueryDescriptor<V>],
  MapQueryResult<K, V>
> {
  constructor(keys: QueryDescriptor<Readonly<K>>, values: QueryDescriptor<V>) {
    super(Tuple(keys, values));
  }

  inspect() {
    return inspectable(MapQuery, this.descriptor.inspect().children);
  }

  protected getQueryResult(fetchCache: FetchCache<[Readonly<K>, V]>) {
    return new Map(fetchCache.values());
  }
}

/** Used to create maps out of components.
 *
 * If you want the key to be the entity, use `EntityMapQuery()` instead.
 *
 * If you want the value to be the entity instead of the key, use `EntityLookup()` instead.
 */
export function MapQuery<K, V>(
  keys: QueryDescriptor<Readonly<K>>,
  values: QueryDescriptor<V>,
): MapQueryFactory<K, V> {
  return new MapQueryFactory(keys, values);
}

/** Used to create maps out of components where the lookup key is the associated entity.
 *
 * If you want to use a component's value as an entity, use `MapQuery()` instead.
 */
export function EntityMapQuery<Q extends [...QueryDescriptor[]]>(
  ...qs: Q
): MapQueryFactory<EcsEntity, QueryTuple<Q>> {
  return new MapQueryFactory(Entity(), Tuple(...qs));
}

/**
 * Eagerly turn iterables into arrays before they are included into a query's results.
 */
export function Eager<T>(
  query: QueryDescriptor<Iterable<T>>,
): QueryDescriptor<T[]> {
  return {
    inspect() {
      return inspectable(Eager, [query]);
    },
    *dependencies() {
      yield query;
    },
    newQuery(world) {
      const inner = query.newQuery(world);
      return {
        ...inner,
        fetch(ctx) {
          return Array.from(inner.fetch(ctx));
        },
      };
    },
  };
}
