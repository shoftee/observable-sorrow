import { EcsEntity } from "@/app/ecs";

import {
  All,
  AllParams,
  AllResults,
  Entity,
  MapQuery,
  OneOrMoreCtors,
  Every,
} from "..";
import {
  defaultFilter,
  defaultQuery,
  FilterDescriptor,
  QueryDescriptor,
} from "../types";

type WithParent = FilterDescriptor;
export function WithParent(...ctors: OneOrMoreCtors): WithParent {
  return {
    newFilter({ queries, hierarchy }) {
      const descriptor = All(Entity()).filter(Every(...ctors));
      queries.register(descriptor);
      const parentsQuery = queries.get(descriptor);

      return defaultFilter({
        matches({ entity }) {
          const parent = hierarchy.parentOf(entity);
          return !!parent && parentsQuery.has(parent);
        },
        cleanup() {
          parentsQuery.cleanup();
        },
      });
    },
  };
}

type Parent = QueryDescriptor<EcsEntity | undefined>;
export function Parent(): Parent {
  return {
    newQuery({ hierarchy }) {
      return defaultQuery({
        fetch({ entity }) {
          return hierarchy.parentOf(entity)!;
        },
      });
    },
  };
}

type Parents = QueryDescriptor<Iterable<EcsEntity>>;
export function Parents(): Parents {
  return {
    newQuery({ hierarchy }) {
      return defaultQuery({
        fetch({ entity }) {
          return hierarchy.parentsOf(entity);
        },
      });
    },
  };
}

type ParentQuery<Q extends AllParams> = QueryDescriptor<
  AllResults<Q> | undefined
>;
export function ParentQuery<Q extends AllParams>(...qs: Q): ParentQuery<Q> {
  const mapQuery = MapQuery(Entity(), All(...qs));
  return {
    newQuery(world) {
      const { hierarchy } = world;
      const fetcher = mapQuery.create(world);

      return defaultQuery({
        fetch({ entity }) {
          const parent = hierarchy.parentOf(entity);
          if (parent) {
            return fetcher.fetch().get(parent)!;
          } else {
            return undefined;
          }
        },
        cleanup() {
          fetcher.cleanup?.();
        },
      });
    },
  };
}

type Children = QueryDescriptor<Iterable<EcsEntity>>;
export function Children(): Children {
  return {
    newQuery({ hierarchy }) {
      return defaultQuery({
        fetch({ entity }) {
          return hierarchy.childrenOf(entity);
        },
      });
    },
  };
}

type ChildrenQuery<Q extends AllParams> = QueryDescriptor<
  Iterable<AllResults<Q>>
>;
export function ChildrenQuery<Q extends AllParams>(...qs: Q): ChildrenQuery<Q> {
  const mapQuery = MapQuery(Entity(), All(...qs));
  return {
    newQuery(world) {
      const fetcher = mapQuery.create(world);

      return defaultQuery({
        *fetch({ entity }) {
          const lookup = fetcher.fetch();
          for (const child of world.hierarchy.childrenOf(entity)) {
            const results = lookup.get(child);
            if (results) {
              yield results;
            }
          }
        },
        cleanup() {
          fetcher.cleanup?.();
        },
      });
    },
  };
}
