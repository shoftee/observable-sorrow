import { all, any } from "@/app/utils/collections";
import { Constructor as Ctor } from "@/app/utils/types";

import { EcsComponent, World } from "@/app/ecs";
import {
  QueryDescriptor,
  FilterDescriptor,
  InstantiatedQuery,
  defaultFilter,
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
        return all(filterIterator(), (f) => f.includes(ctx));
      },
      matches(ctx) {
        return all(filterIterator(), (f) => f.matches(ctx));
      },
      fetch(ctx) {
        return queries.map((q) => q.fetch(ctx)) as AllResults<Q>;
      },
      cleanup() {
        queries.forEach((q) => q.cleanup());
        filters?.forEach((f) => f.cleanup());
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

export type OneOrMoreCtors = [Ctor<EcsComponent>, ...Ctor<EcsComponent>[]];

type Every = FilterDescriptor;
export function Every(...ctors: OneOrMoreCtors): Every {
  return {
    newFilter() {
      return defaultFilter({
        includes({ archetype }) {
          return all(ctors, (ctor) => archetype.has(ctor));
        },
      });
    },
  };
}

type Any = FilterDescriptor;
export function Any(...ctors: OneOrMoreCtors): Any {
  return {
    newFilter() {
      return defaultFilter({
        includes({ archetype }) {
          return any(ctors, (ctor) => archetype.has(ctor));
        },
      });
    },
  };
}

type None = FilterDescriptor;
export function None(...ctors: OneOrMoreCtors): None {
  return {
    newFilter() {
      return defaultFilter({
        includes({ archetype }) {
          return all(ctors, (ctor) => !archetype.has(ctor));
        },
      });
    },
  };
}
