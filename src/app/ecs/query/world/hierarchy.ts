import { EcsEntity, inspectable } from "@/app/ecs";

import { QueryDescriptor, QueryTuple } from "../types";

import { EntityMapQuery } from "..";

type Parent = QueryDescriptor<EcsEntity>;
export function Parent(): Parent {
  return {
    inspect() {
      return inspectable(Parent);
    },
    newQuery({ hierarchy }) {
      return {
        matches({ entity }) {
          return !!hierarchy.parentOf(entity);
        },
        fetch({ entity }) {
          return hierarchy.parentOf(entity)!;
        },
      };
    },
  };
}

type Parents = QueryDescriptor<Iterable<EcsEntity>>;
export function Parents(): Parents {
  return {
    inspect() {
      return inspectable(Parents);
    },
    newQuery({ hierarchy }) {
      return {
        fetch({ entity }) {
          return hierarchy.parentsOf(entity);
        },
      };
    },
  };
}

type ParentQuery<Q extends [...QueryDescriptor[]]> = QueryDescriptor<
  QueryTuple<Q>
>;
export function ParentQuery<Q extends [...QueryDescriptor[]]>(
  ...qs: Q
): ParentQuery<Q> {
  const mapQuery = EntityMapQuery(...qs);
  return {
    inspect() {
      return inspectable(ParentQuery, qs);
    },
    newQuery(world) {
      const { hierarchy } = world;
      const fetcher = mapQuery.create(world);

      return {
        matches({ entity }) {
          const parent = hierarchy.parentOf(entity)!;
          return !!parent && fetcher.fetch().has(parent);
        },
        fetch({ entity }) {
          const parent = hierarchy.parentOf(entity)!;
          return fetcher.fetch().get(parent)!;
        },
        cleanup() {
          fetcher.cleanup?.();
        },
      };
    },
  };
}

type Children = QueryDescriptor<Iterable<EcsEntity>>;
export function Children(): Children {
  return {
    inspect() {
      return inspectable(Children);
    },
    newQuery({ hierarchy }) {
      return {
        fetch({ entity }) {
          return hierarchy.childrenOf(entity);
        },
      };
    },
  };
}

type ChildrenQuery<Q extends [...QueryDescriptor[]]> = QueryDescriptor<
  Iterable<QueryTuple<Q>>
>;
export function ChildrenQuery<Q extends [...QueryDescriptor[]]>(
  ...qs: Q
): ChildrenQuery<Q> {
  const mapQuery = EntityMapQuery(...qs);
  return {
    inspect() {
      return inspectable(ParentQuery, qs);
    },
    newQuery(world) {
      const fetcher = mapQuery.create(world);

      return {
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
      };
    },
  };
}
