import { Constructor as Ctor } from "@/app/utils/types";
import { cache } from "@/app/utils/collections";

import { EcsComponent, EcsEntity, World } from "@/app/ecs";

import { All, AllParams, AllResults, Entity, MapQuery, With } from "..";
import { FilterDescriptor, QueryDescriptor } from "../types";
import { Enumerable } from "@/app/utils/enumerable";

type WithParent = FilterDescriptor;
export function WithParent(...ctors: Ctor<EcsComponent>[]): WithParent {
  return {
    newFilter({ queries, hierarchy }) {
      const descriptor = All(Entity()).filter(With(...ctors));
      queries.register(descriptor);
      const parentsQuery = queries.get(descriptor);

      return {
        matches({ entity }) {
          const parent = hierarchy.parentOf(entity);
          return !!parent && parentsQuery.has(parent);
        },
        cleanup() {
          parentsQuery.cleanup();
        },
      };
    },
  };
}

export function ChildrenIterable<Q extends AllParams>(
  ...qs: Q
): QueryDescriptor<Iterable<AllResults<Q>>> {
  const mapQuery = MapQuery(Entity(), All(...qs));
  return {
    newQuery(world) {
      const fetcher = mapQuery.create(world);
      const lookup = cache(() => {
        return fetcher.fetch().map();
      });

      return {
        fetch({ entity }) {
          return iterateChildResults(world, entity, lookup.retrieve());
        },
        cleanup() {
          lookup.invalidate();
          fetcher.cleanup?.();
        },
      };
    },
  };
}

export function Children<Q extends AllParams>(
  ...qs: Q
): QueryDescriptor<AllResults<Q>[]> {
  const mapQuery = MapQuery(Entity(), All(...qs));
  return {
    newQuery(world) {
      const fetcher = mapQuery.create(world);
      const lookup = cache(() => {
        return fetcher.fetch().map();
      });

      return {
        fetch({ entity }) {
          return Array.from(
            iterateChildResults(world, entity, lookup.retrieve()),
          );
        },
        cleanup() {
          lookup.invalidate();
          fetcher.cleanup?.();
        },
      };
    },
  };
}

type Parent<Q extends AllParams> = QueryDescriptor<AllResults<Q>>;
export function Parent<Q extends AllParams>(...qs: Q): Parent<Q> {
  const mapQuery = MapQuery(Entity(), All(...qs));
  return {
    newQuery(world) {
      const fetcher = mapQuery.create(world);
      const lookup = cache(() => {
        return fetcher.fetch().map();
      });

      return {
        includes({ entity }) {
          return !!parentOf(world, entity);
        },
        matches({ entity }) {
          const parent = parentOf(world, entity);
          return !!parent && lookup.retrieve().has(parent);
        },
        fetch({ entity }) {
          const parent = parentOf(world, entity)!;
          return lookup.retrieve().get(parent)!;
        },
        cleanup() {
          lookup.invalidate();
          fetcher.cleanup?.();
        },
      };
    },
  };
}

function parentOf(world: World, child: EcsEntity) {
  return world.hierarchy.parentOf(child);
}

function* iterateChildResults<Q extends AllParams>(
  world: World,
  parent: EcsEntity,
  lookup: ReadonlyMap<EcsEntity, AllResults<Q>>,
) {
  const children = world.hierarchy.childrenOf(parent);
  yield* new Enumerable(children).filterMap((child) => lookup.get(child));
}
