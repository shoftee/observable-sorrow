import { all } from "@/app/utils/collections";

import { Archetype, World } from "@/app/ecs";

import {
  QueryDescriptor,
  QueryTuple,
  WorldQuery,
  FilterDescriptor,
  OneOrMoreFilters,
} from "../types";
import { EcsMetadata, inspectable } from "../../types";

export class TupleQueryDescriptor<Q extends [...QueryDescriptor[]]>
  implements QueryDescriptor<QueryTuple<Q>>
{
  constructor(readonly queries: Q, readonly filters: FilterDescriptor[]) {}

  inspect(): EcsMetadata {
    return inspectable(Tuple, this.dependencies());
  }

  *dependencies() {
    yield* this.filters;
    yield* this.queries;
  }

  includes(archetype: Archetype): boolean {
    return all(this.dependencies(), (f) => f.includes?.(archetype) ?? true);
  }

  newQuery(world: World): WorldQuery<QueryTuple<Q>> {
    const filters = this.filters.map((f) => f.newFilter(world));
    const queries = this.queries.map((q) => q.newQuery(world));
    const instances = function* () {
      yield* filters;
      yield* queries;
    };

    return {
      matches(ctx) {
        return all(instances(), (f) => f.matches?.(ctx) ?? true);
      },
      cleanup() {
        for (const { cleanup } of instances()) {
          cleanup?.();
        }
      },
      fetch(ctx) {
        return queries.map((q) => q.fetch(ctx)) as QueryTuple<Q>;
      },
    };
  }

  filter(...filters: OneOrMoreFilters): TupleQueryDescriptor<Q> {
    return new TupleQueryDescriptor(this.queries, [
      ...this.filters,
      ...filters,
    ]);
  }
}

/** Includes results only when they match all provided sub-queries. */
export function Tuple<Q extends [...QueryDescriptor[]]>(
  ...qs: Q
): TupleQueryDescriptor<Q> {
  return new TupleQueryDescriptor(qs, []);
}
