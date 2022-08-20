import { all } from "@/app/utils/collections";
import { Constructor as Ctor } from "@/app/utils/types";

import { EcsComponent, World } from "@/app/ecs";
import {
  QueryDescriptor,
  FilterDescriptor,
  InstantiatedFilter,
  InstantiatedQuery,
} from "../types";

export type AllParams = [...QueryDescriptor[]];
export type AllResults<T> = T extends [infer Head, ...infer Tail]
  ? [...UnwrapResult<Head>, ...AllResults<Tail>]
  : [];
type UnwrapResult<T> = T extends QueryDescriptor<infer Fetch> ? [Fetch] : [T];

export type Filters = [...FilterDescriptor[]];

class AllQuery<Q extends AllParams> extends QueryDescriptor<AllResults<Q>> {
  private filters?: FilterDescriptor[];

  constructor(private readonly queries: Q) {
    super();
  }

  newQuery(world: World): InstantiatedQuery<AllResults<Q>> {
    const queries = this.queries.map((inner) => inner.newQuery(world));
    const filters = this.filters?.map((inner) => inner.newFilter(world));
    const filterIterator = function* () {
      yield* queries;
      if (filters) {
        yield* filters;
      }
    };

    return {
      includes(ctx) {
        return all(filterIterator(), (f) => f.includes?.(ctx) ?? true);
      },
      matches(ctx) {
        return all(filterIterator(), (f) => f.matches?.(ctx) ?? true);
      },
      fetch(ctx) {
        return queries.map((q) => q.fetch(ctx)) as AllResults<Q>;
      },
      cleanup() {
        queries.forEach((q) => q.cleanup?.());
        filters?.forEach((f) => f.cleanup?.());
      },
    };
  }

  filter<F extends Filters>(...filters: F): AllQuery<Q> {
    this.filters = filters;
    return this;
  }
}

/** Includes results only when they match all provided sub-queries. */
export function All<Q extends AllParams>(...qs: Q): AllQuery<Q> {
  return new AllQuery(qs);
}

type With = FilterDescriptor;
export function With(...ctors: Ctor<EcsComponent>[]): With {
  return {
    newFilter(): InstantiatedFilter {
      return {
        includes: ({ archetype }) => {
          return all(ctors, (ctor) => archetype.has(ctor));
        },
      };
    },
  };
}

type Without = FilterDescriptor;
export function Without(...ctors: Ctor<EcsComponent>[]): Without {
  return {
    newFilter(): InstantiatedFilter {
      return {
        includes: ({ archetype }) => {
          return all(ctors, (ctor) => !archetype.has(ctor));
        },
      };
    },
  };
}
