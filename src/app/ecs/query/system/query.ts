import { single } from "@/app/utils/collections";

import { EcsEntity, World } from "@/app/ecs";
import { FetcherFactory, QueryDescriptor } from "../types";
import { All, AllParams, Filters } from "../basic/all";

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

    const cache = world.queries.get(descriptor);
    const fetcher = {
      *all() {
        yield* cache.results();
      },
      single() {
        return single(this.all());
      },
      get(entity: EcsEntity) {
        return cache.get(entity);
      },
      has(entity: EcsEntity) {
        return cache.has(entity);
      },
    };

    return {
      fetch() {
        return fetcher;
      },
      cleanup() {
        cache.cleanup();
      },
    };
  }
}

export function Query<Q extends AllParams>(...wq: Q): QueryFactory<Q> {
  return new QueryFactory<Q>(...wq);
}

type MapQueryFactory<K, V> = FetcherFactory<{
  map(): ReadonlyMap<Readonly<K>, V>;
}>;

export function MapQuery<K, V>(
  keys: QueryDescriptor<Readonly<K>>,
  values: QueryDescriptor<V>,
): MapQueryFactory<K, V> {
  const descriptor = All(keys, values);
  return {
    create({ queries }) {
      queries.register(descriptor);

      const fetchCache = queries.get(descriptor);
      const fetcher = {
        map() {
          return new Map(fetchCache.results());
        },
      };

      return {
        fetch() {
          return fetcher;
        },
        cleanup() {
          fetchCache.cleanup();
        },
      };
    },
  };
}
