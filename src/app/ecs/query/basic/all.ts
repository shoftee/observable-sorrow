import { all, any } from "@/app/utils/collections";
import { cache } from "@/app/utils/cache";

import { World, EcsEntity } from "@/app/ecs";

import {
  EntityQueryFactory,
  EntityFilterFactory,
  EntityFilterFactoryTuple,
  EntityQueryFactoryTuple,
  EntityQueryResultTuple,
  EntityQuery,
  defaultFilter,
  OneOrMoreCtors,
  WorldQueryFactory,
} from "../types";

class AllEntityQuery<
  Q extends EntityQueryFactoryTuple,
> extends EntityQueryFactory<EntityQueryResultTuple<Q>> {
  constructor(
    private readonly queries: Q,
    private readonly filters: EntityFilterFactoryTuple,
  ) {
    super();
  }

  newQuery(world: World): EntityQuery<EntityQueryResultTuple<Q>> {
    const filters = this.filters.map((inner) => inner.newFilter(world));
    const queries = this.queries.map((inner) => inner.newQuery(world));
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
        queries.forEach((q) => q.cleanup());
        filters?.forEach((f) => f.cleanup());
      },
    };
  }

  newWithFilters<F extends EntityFilterFactoryTuple>(
    ...filters: F
  ): AllEntityQuery<Q> {
    return new AllEntityQuery(this.queries, [...this.filters, ...filters]);
  }
}

/** Includes results only when they match all provided sub-queries. */
export function All<Q extends EntityQueryFactoryTuple>(
  ...qs: Q
): AllEntityQuery<Q> {
  return new AllEntityQuery(qs, []);
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

type Intersect = EntityFilterFactory;
export function Intersect(
  other: WorldQueryFactory<IterableIterator<EcsEntity>>,
): Intersect {
  return {
    newFilter(world) {
      const wq = other.create(world);
      const cached = cache(() => new Set(wq.fetch()));
      return defaultFilter({
        includes({ entity }) {
          return cached.retrieve().has(entity);
        },
        cleanup() {
          cached.invalidate();
          wq.cleanup?.();
        },
      });
    },
  };
}
