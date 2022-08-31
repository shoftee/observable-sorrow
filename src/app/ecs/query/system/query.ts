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

  filter<F extends EntityFilterFactoryTuple>(...f: F): IterableQueryFactory<Q> {
    this.descriptor = this.descriptor.filter(...f);
    return this;
  }

  create(world: World) {
    const descriptor = this.descriptor;
    world.queries.register(descriptor);

    const fetchCache = world.queries.get(descriptor);
    const map = cache(() => new Map(fetchCache.results()));
    const fetcher: IterableQueryResult<EntityQueryResultTuple<Q>> = {
      [Symbol.iterator]() {
        return map.retrieve().values();
      },
    };

    return {
      fetch() {
        return fetcher;
      },
      cleanup() {
        map.invalidate();
        fetchCache.cleanup();
      },
    };
  }
}

export function Query<Q extends EntityQueryFactoryTuple>(
  ...wq: Q
): IterableQueryFactory<Q> {
  return new IterableQueryFactory<Q>(...wq);
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

  filter<F extends EntityFilterFactoryTuple>(...f: F): MapQueryFactory<K, V> {
    this.descriptor = this.descriptor.filter(...f);
    return this;
  }

  create(world: World) {
    const descriptor = this.descriptor;
    world.queries.register(descriptor);

    const fetchCache = world.queries.get(descriptor);
    const map = cache(() => new Map(fetchCache.resultValues()));
    const fetcher: MapQueryResult<K, V> = {
      [Symbol.iterator]() {
        return map.retrieve()[Symbol.iterator]();
      },
      entries() {
        return map.retrieve().entries();
      },
      keys() {
        return map.retrieve().keys();
      },
      values() {
        return map.retrieve().values();
      },
      get(key) {
        return map.retrieve().get(key);
      },
      has(key) {
        return map.retrieve().has(key);
      },
    };

    return {
      fetch() {
        return fetcher;
      },
      cleanup() {
        map.invalidate();
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
