import { cache, single } from "@/app/utils/collections";

import { EcsEntity, World } from "@/app/ecs";
import { FetcherFactory, QueryDescriptor } from "../types";
import { All, AllParams, AllResults, Filters } from "../basic/all";

type QueryResult<Result> = {
  [Symbol.iterator](): IterableIterator<Result>;
  single(): Result;
  get(entity: EcsEntity): Result | undefined;
  has(entity: EcsEntity): boolean;
};

class QueryFactory<Q extends AllParams> {
  private descriptor;

  constructor(...wq: Q) {
    this.descriptor = All(...wq);
  }

  filter<F extends Filters>(...f: F): QueryFactory<Q> {
    this.descriptor = this.descriptor.filter(...f);
    return this;
  }

  create(world: World) {
    const descriptor = this.descriptor;
    world.queries.register(descriptor);

    const fetchCache = world.queries.get(descriptor);
    const map = cache(() => new Map(fetchCache.results()));
    const fetcher: QueryResult<AllResults<Q>> = {
      [Symbol.iterator]() {
        return map.retrieve().values();
      },
      single() {
        return single(this);
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

export function Query<Q extends AllParams>(...wq: Q): QueryFactory<Q> {
  return new QueryFactory<Q>(...wq);
}

type MapQueryResult<K, V> = {
  [Symbol.iterator](): IterableIterator<[Readonly<K>, V]>;
  get(key: Readonly<K>): V | undefined;
  has(key: Readonly<K>): boolean;
};

type MapQueryFactory<K, V> = FetcherFactory<MapQueryResult<K, V>>;

export function MapQuery<K, V>(
  keys: QueryDescriptor<Readonly<K>>,
  values: QueryDescriptor<V>,
): MapQueryFactory<K, V> {
  const descriptor = All(keys, values);
  return {
    create({ queries }) {
      queries.register(descriptor);

      const fetchCache = queries.get(descriptor);
      const map = cache(() => new Map(fetchCache.resultValues()));
      const fetcher: MapQueryResult<K, V> = {
        [Symbol.iterator]() {
          return map.retrieve()[Symbol.iterator]();
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
    },
  };
}
