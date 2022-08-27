import { cache } from "@/app/utils/cache";

import { EcsEntity, World } from "@/app/ecs";

import { FetcherFactory, QueryDescriptor } from "../types";
import { All, AllParams, AllResults, Filters } from "../basic/all";
import { Entity } from "../basic/entity";

export type IterableQueryResult<Result> = {
  [Symbol.iterator](): IterableIterator<Result>;
  map(): ReadonlyMap<EcsEntity, Result>;
  get(entity: EcsEntity): Result | undefined;
  has(entity: EcsEntity): boolean;
};

class IterableQueryFactory<Q extends AllParams> {
  private descriptor;

  constructor(...wq: Q) {
    this.descriptor = All(...wq);
  }

  filter<F extends Filters>(...f: F): IterableQueryFactory<Q> {
    this.descriptor = this.descriptor.filter(...f);
    return this;
  }

  create(world: World) {
    const descriptor = this.descriptor;
    world.queries.register(descriptor);

    const fetchCache = world.queries.get(descriptor);
    const map = cache(() => new Map(fetchCache.results()));
    const fetcher: IterableQueryResult<AllResults<Q>> = {
      [Symbol.iterator]() {
        return map.retrieve().values();
      },
      map() {
        return map.retrieve();
      },
      get(entity: EcsEntity) {
        return map.retrieve().get(entity);
      },
      has(entity: EcsEntity) {
        return map.retrieve().has(entity);
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

export function Query<Q extends AllParams>(...wq: Q): IterableQueryFactory<Q> {
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

class MapQueryFactory<K, V> implements FetcherFactory<MapQueryResult<K, V>> {
  private descriptor;
  constructor(keys: QueryDescriptor<Readonly<K>>, values: QueryDescriptor<V>) {
    this.descriptor = All(keys, values);
  }

  filter<F extends Filters>(...f: F): MapQueryFactory<K, V> {
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
  keys: QueryDescriptor<Readonly<K>>,
  values: QueryDescriptor<V>,
): MapQueryFactory<K, V> {
  return new MapQueryFactory(keys, values);
}

export function EntityMapQuery<V>(
  values: QueryDescriptor<V>,
): MapQueryFactory<EcsEntity, V> {
  return new MapQueryFactory(Entity(), values);
}
