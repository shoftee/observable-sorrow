import { cache } from "@/app/utils/cache";
import { single } from "@/app/utils/collections";

import { EcsEntity, EcsMetadata, World, inspectable } from "@/app/ecs";

import {
  SystemParamDescriptor,
  QueryDescriptor,
  QueryTuple,
  OneOrMoreFilters,
  SystemParameter,
} from "../types";

import { Tuple, Entity, TupleQueryDescriptor } from "..";

export interface IterableQueryResult<Result> {
  [Symbol.iterator](): IterableIterator<Result>;
}

export interface MapQueryResult<K, V>
  extends IterableQueryResult<[Readonly<K>, V]> {
  entries(): IterableIterator<[Readonly<K>, V]>;
  keys(): IterableIterator<Readonly<K>>;
  values(): IterableIterator<V>;
  get(key: Readonly<K>): V | undefined;
  has(key: Readonly<K>): boolean;
}

abstract class QueryFactoryBase<Q extends [...QueryDescriptor[]], R>
  implements SystemParamDescriptor<R>
{
  constructor(protected descriptor: TupleQueryDescriptor<Q>) {}

  filter(...filters: OneOrMoreFilters) {
    this.descriptor = this.descriptor.filter(...filters);
    return this;
  }

  abstract inspect(): EcsMetadata;

  protected abstract getQueryResult(
    iterable: IterableIterator<QueryTuple<Q>>,
  ): R;

  create(world: World): SystemParameter<R> {
    const fetchCache = world.queries.registerAndGet(this.descriptor);
    const fetcher = cache(() => this.getQueryResult(fetchCache.values()));

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

class IterableQueryFactory<
  Q extends [...QueryDescriptor[]],
> extends QueryFactoryBase<Q, IterableQueryResult<QueryTuple<Q>>> {
  constructor(...wq: Q) {
    super(Tuple(...wq));
  }

  inspect() {
    return this.descriptor.inspect();
  }

  protected getQueryResult(iterable: IterableIterator<QueryTuple<Q>>) {
    return Array.from(iterable);
  }
}

class SingleQueryFactory<
  Q extends [...QueryDescriptor[]],
> extends QueryFactoryBase<Q, QueryTuple<Q>> {
  constructor(...wq: Q) {
    super(Tuple(...wq));
  }

  inspect() {
    return inspectable(Single, this.descriptor.inspect().children);
  }

  protected getQueryResult(iterable: IterableIterator<QueryTuple<Q>>) {
    return single(iterable);
  }
}

class MapQueryFactory<K, V> extends QueryFactoryBase<
  [QueryDescriptor<Readonly<K>>, QueryDescriptor<V>],
  MapQueryResult<K, V>
> {
  constructor(
    readonly keys: QueryDescriptor<Readonly<K>>,
    readonly values: QueryDescriptor<V>,
  ) {
    super(Tuple(keys, values));
  }

  inspect() {
    return inspectable(MapQuery, this.descriptor.inspect().children);
  }

  protected getQueryResult(iterable: IterableIterator<[Readonly<K>, V]>) {
    return new Map(iterable);
  }
}

export function Query<Q extends [...QueryDescriptor[]]>(
  ...qs: Q
): IterableQueryFactory<Q> {
  return new IterableQueryFactory(...qs);
}

/** Like `Query(...)`, but only works if there's a single result from the query. If there are 0 or more than 1 results, an error is thrown during data retrieval. */
export function Single<Q extends [...QueryDescriptor[]]>(
  ...qs: Q
): SingleQueryFactory<Q> {
  return new SingleQueryFactory(...qs);
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

/** Used to create a lookup from a component's value to the component's associated entity.
 *
 * If you want the entity to be the key instead of the value, use `EntityMapQuery()` instead.
 */
export function EntityLookup<K>(
  keys: QueryDescriptor<Readonly<K>>,
): MapQueryFactory<K, Readonly<EcsEntity>> {
  return new MapQueryFactory(keys, Entity());
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
