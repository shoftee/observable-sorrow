import { cache } from "@/app/utils/cache";
import { all, any } from "@/app/utils/collections";

import { EcsEntity } from "@/app/ecs";

import {
  EntityFilterFactory,
  OneOrMoreCtors,
  defaultFilter,
  WorldQueryFactory,
} from "../types";

type Has = EntityFilterFactory;
export function Has(...ctors: OneOrMoreCtors): Has {
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

type HasAny = EntityFilterFactory;
export function HasAny(...ctors: OneOrMoreCtors): HasAny {
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

type HasNone = EntityFilterFactory;
export function HasNone(...ctors: OneOrMoreCtors): HasNone {
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
