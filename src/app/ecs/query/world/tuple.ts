import { all, ofType } from "@/app/utils/collections";

import { Archetype, World } from "@/app/ecs";

import {
  QueryDescriptor,
  UnwrapDescriptorTuple as Unwrap,
  WorldQuery,
  FilterDescriptor,
  Descriptor,
  isFilterDescriptor,
  isQueryDescriptor,
} from "../types";
import { inspectable } from "../../types";

export class TupleQueryDescriptor<Q extends Descriptor[]>
  implements QueryDescriptor<Unwrap<Q>>
{
  private readonly filters: FilterDescriptor[];
  private readonly queries: QueryDescriptor[];

  constructor(readonly descriptors: Descriptor[]) {
    this.filters = Array.from(ofType(descriptors, isFilterDescriptor));
    this.queries = Array.from(ofType(descriptors, isQueryDescriptor));
  }

  inspect() {
    return inspectable(Tuple, this.descriptors);
  }

  *dependencies() {
    yield* this.descriptors;
  }

  includes(archetype: Archetype): boolean {
    return all(this.descriptors, (f) => f.includes?.(archetype) ?? true);
  }

  newQuery(world: World): WorldQuery<Unwrap<Q>> {
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
        return queries.map((q) => q.fetch(ctx)) as Unwrap<Q>;
      },
    };
  }
}

/** Includes results only when they match all provided sub-queries. */
export function Tuple<Q extends [...Descriptor[]]>(
  ...qs: Q
): TupleQueryDescriptor<Q> {
  return new TupleQueryDescriptor(qs);
}
