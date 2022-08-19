import { single } from "@/app/utils/collections";

import { EcsEntity, WorldState } from "@/app/ecs";
import { Fetcher, FetcherFactory, QueryDescriptor } from "../types";
import { All, AllParams, AllResults, Filters } from "../basic/all";

type QueryFetcher<Q extends AllParams> = {
  all(): Iterable<AllResults<Q>>;
  single(): AllResults<Q>;
  get(entity: EcsEntity): AllResults<Q> | undefined;
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

  create(state: WorldState): Fetcher<QueryFetcher<Q>> {
    const descriptor = this.descriptor;
    state.addQuery(descriptor);

    const cache = state.fetchQuery(descriptor);
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
    create(state: WorldState) {
      state.addQuery(descriptor);

      const fetchCache = state.fetchQuery(descriptor);
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
