import { all } from "@/app/utils/collections";
import { Constructor as Ctor } from "@/app/utils/types";

import { Archetype, EcsComponent, EcsEntity, WorldState } from "@/app/ecs";
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
type UnwrapResult<T> = T extends QueryDescriptor<infer Fetch>
  ? [...UnwrapResult<Fetch>]
  : [T];

export type Filters = [...FilterDescriptor[]];

class AllQuery<Q extends AllParams> extends QueryDescriptor<AllResults<Q>> {
  private filters?: FilterDescriptor[];

  constructor(private readonly queries: Q) {
    super();
  }

  newQuery(state: WorldState): InstantiatedQuery<AllResults<Q>> {
    const queries = this.queries.map((x) => x.newQuery(state));
    const filters = this.filters?.map((x) => x.newFilter(state)) ?? [];
    const filterIterator = function* () {
      yield* queries;
      yield* filters;
    };

    return {
      includes: (archetype: Archetype) => {
        return all(filterIterator(), (f) => f.includes(archetype) ?? true);
      },
      matches: (archetype: Archetype) => {
        return all(filterIterator(), (f) => f.matches?.(archetype) ?? true);
      },
      fetch: (entity: EcsEntity, archetype: Archetype) => {
        return queries.map((q) => q.fetch(entity, archetype)) as AllResults<Q>;
      },
    };
  }

  filter(...filters: FilterDescriptor[]): AllQuery<Q> {
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
        includes: (archetype: Archetype) => {
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
        includes: (archetype: Archetype) => {
          return all(ctors, (ctor) => !archetype.has(ctor));
        },
      };
    },
  };
}
