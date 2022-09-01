import { all } from "@/app/utils/collections";

import { World } from "@/app/ecs";

import {
  EntityQueryFactory,
  EntityQueryFactoryTuple,
  EntityQueryResultTuple,
  EntityQuery,
  EntityFilterFactory,
  OneOrMoreFilters,
} from "../types";

export class TupleQueryFactory<
  Q extends EntityQueryFactoryTuple,
> extends EntityQueryFactory<EntityQueryResultTuple<Q>> {
  constructor(readonly queries: Q, readonly filters: EntityFilterFactory[]) {
    super();
  }

  newQuery(world: World): EntityQuery<EntityQueryResultTuple<Q>> {
    const filters = this.filters.map((f) => f.newFilter(world));
    const queries = this.queries.map((q) => q.newQuery(world));
    const filterIterator = function* () {
      yield* filters;
      yield* queries;
    };

    return {
      includes(ctx) {
        return all(filterIterator(), (f) => f.includes(ctx));
      },
      matches(ctx) {
        return all(filterIterator(), (f) => f.matches(ctx));
      },
      fetch(ctx) {
        return queries.map((q) => q.fetch(ctx)) as EntityQueryResultTuple<Q>;
      },
      cleanup() {
        for (const { cleanup } of filterIterator()) {
          cleanup();
        }
      },
    };
  }

  filter(...filters: OneOrMoreFilters): TupleQueryFactory<Q> {
    return new TupleQueryFactory(this.queries, [...this.filters, ...filters]);
  }
}

/** Includes results only when they match all provided sub-queries. */
export function Tuple<Q extends EntityQueryFactoryTuple>(
  ...qs: Q
): TupleQueryFactory<Q> {
  return new TupleQueryFactory(qs, []);
}
