import { single } from "@/app/utils/collections";

import { WorldState } from "@/app/ecs";
import { Fetcher, QueryDescriptor } from "../types";
import { All, AllParams, AllResults, Filters } from "../basic/all";

type QueryFetcher<Q extends AllParams> = {
  all(): Iterable<AllResults<Q>>;
  single(): AllResults<Q>;
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

    const fetcher = {
      *all() {
        yield* state.fetchQuery(descriptor) as AllResults<Q>;
      },
      single() {
        return single(state.fetchQuery(descriptor)) as AllResults<Q>;
      },
    };

    return {
      fetch() {
        return fetcher;
      },
    };
  }
}

export function Query<Q extends AllParams>(...wq: Q): QueryFactory<Q> {
  return new QueryFactory<Q>(...wq);
}

type ValueDescriptor<T> = QueryDescriptor<Readonly<T>>;

type MapFetcher<K, V> = {
  map(): ReadonlyMap<K, V>;
};

class MapQueryFactory<K, V> {
  private readonly descriptor;

  constructor(keys: ValueDescriptor<K>, values: QueryDescriptor<V>) {
    this.descriptor = All(keys, values);
  }

  create(state: WorldState): Fetcher<MapFetcher<K, V>> {
    const descriptor = this.descriptor;
    state.addQuery(descriptor);

    const fetcher = {
      map() {
        return new Map(state.fetchQuery(descriptor));
      },
    };

    return {
      fetch() {
        return fetcher;
      },
    };
  }
}

export function MapQuery<K, V>(
  keys: ValueDescriptor<K>,
  values: QueryDescriptor<V>,
): MapQueryFactory<K, V> {
  return new MapQueryFactory(keys, values);
}
