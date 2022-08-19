import { Constructor as Ctor } from "@/app/utils/types";
import { cache, MultiMap } from "@/app/utils/collections";

import { Archetype, EcsComponent, EcsEntity, EcsParent } from "@/app/ecs";

import { FilterDescriptor, QueryDescriptor } from "../types";
import { All, AllParams, AllResults, Entity, Query, Value, With } from "..";

type Parent = FilterDescriptor;
export function Parent(...ctors: Ctor<EcsComponent>[]): Parent {
  return {
    newFilter(state) {
      const descriptor = All(Entity()).filter(With(...ctors));
      state.addQuery(descriptor);

      const parentsQuery = state.fetchQuery(descriptor);

      return {
        includes(archetype: Archetype<EcsParent>) {
          const parent = archetype.get(EcsParent);
          return parent ? parentsQuery.has(parent.value) : false;
        },
      };
    },
  };
}

export function Children<Q extends AllParams>(
  ...qs: Q
): QueryDescriptor<Iterable<AllResults<Q>>> {
  const childrenQueryFactory = Query(Value(EcsParent), All(...qs));
  return {
    newQuery(state) {
      const childrenQuery = childrenQueryFactory.create(state);

      const children = cache(() => {
        const map = new MultiMap<EcsEntity, AllResults<Q>>();
        for (const [parent, results] of childrenQuery.fetch().all()) {
          map.add(parent, results);
        }
        return map;
      });

      return {
        fetch(entity) {
          return children.retrieve().entriesForKey(entity);
        },
        cleanup() {
          children.invalidate();
        },
      };
    },
  };
}
