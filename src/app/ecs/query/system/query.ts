import { cache } from "@/app/utils/cache";
import { single, take } from "@/app/utils/collections";

import { EcsEntity, World, inspectable } from "@/app/ecs";
import { FetchCache } from "@/app/ecs/state";

import {
  SystemParamDescriptor,
  QueryDescriptor,
  UnwrapDescriptorTuple,
  Descriptor,
  FilterDescriptor,
  InferQueryResult,
} from "../types";

import { Tuple, Entity } from "..";

type TransformFn<Q extends QueryDescriptor, R> = (
  iterable: FetchCache<InferQueryResult<Q>>,
) => R;

function makeDescriptor<Q extends QueryDescriptor, R>(
  named: { name: string },
  descriptor: Q,
  transform: TransformFn<Q, R>,
): SystemParamDescriptor<R> {
  return {
    inspect() {
      return inspectable(named, [descriptor]);
    },
    create(world: World) {
      const fetchCache = world.queries.registerAndGet(descriptor);
      const resultCache = cache(() => transform(fetchCache));

      return {
        fetch() {
          return resultCache.retrieve();
        },
        cleanup() {
          resultCache.invalidate();
          fetchCache.cleanup();
        },
      };
    },
  };
}

type IterbleDescriptor<Q extends Descriptor[]> = SystemParamDescriptor<
  Iterable<UnwrapDescriptorTuple<Q>>
>;
/** Builds a data query for the specified descriptors.
 *
 * You can specify both `QueryDescriptor`s and `FilterDescriptor`s in any order, but it's recommended you put the filters at the end.
 */
export function Query<Q extends Descriptor[]>(...qs: Q): IterbleDescriptor<Q> {
  return makeDescriptor(Query, Tuple(...qs), (fetcher) =>
    Array.from(fetcher.values()),
  );
}
/** Like `Query(...)`, but returns at most the first `count` items of the query. */
export function Take<Q extends Descriptor[]>(
  count: number,
  ...qs: Q
): IterbleDescriptor<Q> {
  return makeDescriptor(Take, Tuple(...qs), (fetcher) =>
    take(fetcher.values(), count),
  );
}
/** Equivalent to `Take(1, ...)`. */
export function First<Q extends Descriptor[]>(...qs: Q): IterbleDescriptor<Q> {
  return makeDescriptor(First, Tuple(...qs), (fetcher) =>
    take(fetcher.values(), 1),
  );
}

type SingleDescriptor<Q extends Descriptor[]> = SystemParamDescriptor<
  UnwrapDescriptorTuple<Q>
>;
/** Like `Query(...)`, but only works if there's a single result from the query. If there are 0 or more than 1 results, an error is thrown during data retrieval. */
export function Single<Q extends Descriptor[]>(...qs: Q): SingleDescriptor<Q> {
  return makeDescriptor(Single, Tuple(...qs), (fetcher) =>
    single(fetcher.values()),
  );
}

export interface MapResult<K, V> extends Iterable<[Readonly<K>, V]> {
  entries(): IterableIterator<[Readonly<K>, V]>;
  keys(): IterableIterator<Readonly<K>>;
  values(): IterableIterator<V>;
  get(key: Readonly<K>): V | undefined;
  has(key: Readonly<K>): boolean;
}
type MapDescriptor<K, V> = SystemParamDescriptor<MapResult<K, V>>;
/** Used to create maps out of components.
 *
 * If you want the key to be the entity, use `EntityMapQuery()` instead.
 *
 * If you want the value to be the entity instead of the key, use `EntityLookup()` instead.
 */
export function MapQuery<K, V>(
  keys: QueryDescriptor<Readonly<K>>,
  values: QueryDescriptor<V>,
  ...filters: FilterDescriptor[]
): MapDescriptor<K, V> {
  const tuple = Tuple(keys, values, ...filters);
  return makeDescriptor(
    MapQuery,
    tuple,
    (fetcher) => new Map(fetcher.values()),
  );
}

/** Used to create maps out of components where the lookup key is the associated entity.
 *
 * If you want to use a component's value as an entity, use `MapQuery()` instead.
 */
export function EntityMapQuery<Q extends Descriptor[]>(
  ...qs: Q
): MapDescriptor<EcsEntity, UnwrapDescriptorTuple<Q>> {
  const tuple = Tuple(Entity(), Tuple(...qs));
  return makeDescriptor(
    EntityMapQuery,
    tuple,
    (fetcher) => new Map(fetcher.values()),
  );
}

/** Used to create a lookup from a component's value to the component's associated entity.
 *
 * If you want the entity to be the key instead of the value, use `EntityMapQuery()` instead.
 */
export function EntityLookup<K>(
  keys: QueryDescriptor<K>,
  ...filters: FilterDescriptor[]
): MapDescriptor<K, EcsEntity> {
  const tuple = Tuple(keys, Entity(), ...filters);
  return makeDescriptor(
    EntityLookup,
    tuple,
    (fetcher) => new Map(fetcher.values()),
  );
}

/**
 * Eagerly turn iterables into arrays before they are included into a query's results.
 */
export function Eager<T>(
  qd: QueryDescriptor<Iterable<T>>,
): QueryDescriptor<T[]> {
  return Transform(qd, function Eager(iterable) {
    return Array.from(iterable);
  });
}

export function Transform<T, V>(
  qd: QueryDescriptor<T>,
  transformer: (result: T) => V,
): QueryDescriptor<V> {
  return {
    ...qd,
    inspect() {
      return inspectable(transformer.name ? Transform : transformer, [qd]);
    },
    newQuery(world) {
      const query = qd.newQuery(world);
      return {
        ...query,
        fetch(ctx) {
          return transformer(query.fetch(ctx));
        },
      };
    },
  };
}
