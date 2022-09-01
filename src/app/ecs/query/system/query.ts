import { cache } from "@/app/utils/cache";

import { EcsEntity, World } from "@/app/ecs";

import {
  WorldQueryFactory,
  EntityQueryFactory,
  EntityFilterFactoryTuple,
  EntityQueryFactoryTuple,
  EntityQueryResultTuple,
} from "../types";

import { All, Entity } from "..";
import { single } from "@/app/utils/collections";

export type IterableQueryResult<Result> = {
  [Symbol.iterator](): IterableIterator<Result>;
};

class IterableQueryFactory<Q extends EntityQueryFactoryTuple>
  implements WorldQueryFactory<IterableQueryResult<EntityQueryResultTuple<Q>>>
{
  private descriptor;

  constructor(...wq: Q) {
    this.descriptor = All(...wq);
  }

  filter<F extends EntityFilterFactoryTuple>(...f: F) {
    this.descriptor = this.descriptor.newWithFilters(...f);
    return this;
  }

  create(world: World) {
    const descriptor = this.descriptor;
    world.queries.register(descriptor);
    const fetchCache = world.queries.get(descriptor);

    const fetcher = cache(() => {
      const array = Array.from(fetchCache.values());
      return array as IterableQueryResult<EntityQueryResultTuple<Q>>;
    });

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

export function Query<Q extends EntityQueryFactoryTuple>(
  ...qs: Q
): IterableQueryFactory<Q> {
  return new IterableQueryFactory(...qs);
}

class SingleQueryFactory<Q extends EntityQueryFactoryTuple>
  implements WorldQueryFactory<EntityQueryResultTuple<Q>>
{
  private descriptor;

  constructor(...wq: Q) {
    this.descriptor = All(...wq);
  }

  filter<F extends EntityFilterFactoryTuple>(...f: F) {
    this.descriptor = this.descriptor.newWithFilters(...f);
    return this;
  }

  create(world: World) {
    const descriptor = this.descriptor;
    world.queries.register(descriptor);
    const fetchCache = world.queries.get(descriptor);

    const fetcher = cache(() => single(fetchCache.values()));

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

/** Like `All(...)`, but only works if there's a single result from the query. If there are 0 or more than 1 results, an error is thrown during data retrieval. */
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

class MapQueryFactory<K, V> implements WorldQueryFactory<MapQueryResult<K, V>> {
  private descriptor;
  constructor(
    keys: EntityQueryFactory<Readonly<K>>,
    values: EntityQueryFactory<V>,
  ) {
    this.descriptor = All(keys, values);
  }

  filter<F extends EntityFilterFactoryTuple>(...f: F) {
    this.descriptor = this.descriptor.newWithFilters(...f);
    return this;
  }

  create(world: World) {
    const descriptor = this.descriptor;
    world.queries.register(descriptor);
    const fetchCache = world.queries.get(descriptor);

    const fetcher = cache(() => {
      const map = new Map(fetchCache.values());
      return map as MapQueryResult<K, V>;
    });

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
  return new MapQueryFactory(Entity(), All(...qs));
}
