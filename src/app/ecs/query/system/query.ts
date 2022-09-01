import { cache } from "@/app/utils/cache";
import { single } from "@/app/utils/collections";

import { EcsEntity, World } from "@/app/ecs";
import { FetchCache } from "@/app/ecs/state";

import {
  WorldQueryFactory,
  EntityQueryFactory,
  EntityQueryFactoryTuple,
  EntityQueryResultTuple,
  OneOrMoreFilters,
  WorldQuery,
} from "../types";

import { Tuple, Entity, TupleQueryFactory } from "..";

abstract class QueryFactoryBase<Q extends EntityQueryFactoryTuple, R>
  implements WorldQueryFactory<R>
{
  constructor(private factory: TupleQueryFactory<Q>) {}
  filter(...filters: OneOrMoreFilters) {
    this.factory = this.factory.filter(...filters);
    return this;
  }

  protected abstract getQueryResult(
    fetchCache: FetchCache<EntityQueryResultTuple<Q>>,
  ): R;

  create(world: World): WorldQuery<R> {
    const { factory } = this;
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

class IterableQueryFactory<Q extends EntityQueryFactoryTuple>
  extends QueryFactoryBase<Q, IterableQueryResult<EntityQueryResultTuple<Q>>>
  implements WorldQueryFactory<IterableQueryResult<EntityQueryResultTuple<Q>>>
{
  constructor(...wq: Q) {
    super(Tuple(...wq));
  }

  protected getQueryResult(fetchCache: FetchCache<EntityQueryResultTuple<Q>>) {
    return Array.from(fetchCache.values());
  }
}

export function Query<Q extends EntityQueryFactoryTuple>(
  ...qs: Q
): IterableQueryFactory<Q> {
  return new IterableQueryFactory(...qs);
}

class SingleQueryFactory<Q extends EntityQueryFactoryTuple>
  extends QueryFactoryBase<Q, EntityQueryResultTuple<Q>>
  implements WorldQueryFactory<EntityQueryResultTuple<Q>>
{
  constructor(...wq: Q) {
    super(Tuple(...wq));
  }

  protected getQueryResult(fetchCache: FetchCache<EntityQueryResultTuple<Q>>) {
    return single(fetchCache.values());
  }
}

/** Like `Query(...)`, but only works if there's a single result from the query. If there are 0 or more than 1 results, an error is thrown during data retrieval. */
export function Single<Q extends EntityQueryFactoryTuple>(
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
  [EntityQueryFactory<Readonly<K>>, EntityQueryFactory<V>],
  MapQueryResult<K, V>
> {
  constructor(
    keys: EntityQueryFactory<Readonly<K>>,
    values: EntityQueryFactory<V>,
  ) {
    super(Tuple(keys, values));
  }

  protected getQueryResult(fetchCache: FetchCache<[Readonly<K>, V]>) {
    return new Map(fetchCache.values());
  }
}

/** Used to create maps out of components.
 *
 * If you want the key to be the entity, use `EntityMapQuery()` instead. */
export function MapQuery<K, V>(
  keys: EntityQueryFactory<Readonly<K>>,
  values: EntityQueryFactory<V>,
): MapQueryFactory<K, V> {
  return new MapQueryFactory(keys, values);
}

export function EntityMapQuery<Q extends EntityQueryFactoryTuple>(
  ...qs: Q
): MapQueryFactory<EcsEntity, EntityQueryResultTuple<Q>> {
  return new MapQueryFactory(Entity(), Tuple(...qs));
}
