import { all, any } from "@/app/utils/collections";
import { Constructor as Ctor } from "@/app/utils/types";

import { EcsComponent, World } from "@/app/ecs";
import {
  EntityQueryFactory,
  EntityFilterFactory,
  EntityFilterFactoryTuple,
  EntityQueryFactoryTuple,
  EntityQueryResultTuple,
  EntityQuery,
  defaultFilter,
} from "../types";

export type OneOrMoreCtors = [Ctor<EcsComponent>, ...Ctor<EcsComponent>[]];

class AllComponentQuery<
  Q extends EntityQueryFactoryTuple,
> extends EntityQueryFactory<EntityQueryResultTuple<Q>> {
  private filters?: EntityFilterFactory[];

  constructor(private readonly queries: Q) {
    super();
  }

  newQuery(world: World): EntityQuery<EntityQueryResultTuple<Q>> {
    const queries = this.queries.map((inner) => inner.newQuery(world));
    const filters = this.filters?.map((inner) => inner.newFilter(world));
    const filterIterator = function* () {
      if (filters) {
        yield* filters;
      }
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
        queries.forEach((q) => q.cleanup());
        filters?.forEach((f) => f.cleanup());
      },
    };
  }

  filter<F extends EntityFilterFactoryTuple>(
    ...filters: F
  ): AllComponentQuery<Q> {
    this.filters = filters;
    return this;
  }
}

/** Includes results only when they match all provided sub-queries. */
export function All<Q extends EntityQueryFactoryTuple>(
  ...qs: Q
): AllComponentQuery<Q> {
  return new AllComponentQuery(qs);
}

type Every = EntityFilterFactory;
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

type Any = EntityFilterFactory;
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

type None = EntityFilterFactory;
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
