import { EcsEntity } from "@/app/ecs";

import { Tuple, Entity, MapQuery } from "..";
import {
  defaultQuery,
  EntityQueryFactory,
  EntityQueryFactoryTuple,
  EntityQueryResultTuple,
} from "../types";

type Parent = EntityQueryFactory<EcsEntity>;
export function Parent(): Parent {
  return {
    newQuery({ hierarchy }) {
      return defaultQuery({
        matches({ entity }) {
          return !!hierarchy.parentOf(entity);
        },
        fetch({ entity }) {
          return hierarchy.parentOf(entity)!;
        },
      });
    },
  };
}

type Parents = EntityQueryFactory<Iterable<EcsEntity>>;
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

type ParentQuery<Q extends EntityQueryFactoryTuple> = EntityQueryFactory<
  EntityQueryResultTuple<Q>
>;
export function ParentQuery<Q extends EntityQueryFactoryTuple>(
  ...qs: Q
): ParentQuery<Q> {
  const mapQuery = MapQuery(Entity(), Tuple(...qs));
  return {
    newQuery(world) {
      const { hierarchy } = world;
      const fetcher = mapQuery.create(world);

      return defaultQuery({
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
      });
    },
  };
}

type Children = EntityQueryFactory<Iterable<EcsEntity>>;
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

type ChildrenQuery<Q extends EntityQueryFactoryTuple> = EntityQueryFactory<
  Iterable<EntityQueryResultTuple<Q>>
>;
export function ChildrenQuery<Q extends EntityQueryFactoryTuple>(
  ...qs: Q
): ChildrenQuery<Q> {
  const mapQuery = MapQuery(Entity(), Tuple(...qs));
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
