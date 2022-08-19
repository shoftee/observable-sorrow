import { Constructor as Ctor } from "@/app/utils/types";
import { cache, MultiMap } from "@/app/utils/collections";

import {
  Archetype,
  EcsComponent,
  EcsEntity,
  EcsParent,
  WorldState,
} from "@/app/ecs";

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

class ChildrenQueryDescriptor<Q extends AllParams> {
  private readonly queries;

  constructor(...qs: Q) {
    this.queries = Query(Value(EcsParent), All(...qs));
  }

  private getChildrenCache(state: WorldState) {
    const childrenQuery = this.queries.create(state);

    const children = cache(() => {
      const map = new MultiMap<EcsEntity, AllResults<Q>>();
      for (const [parent, results] of childrenQuery.fetch().all()) {
        map.add(parent, results);
      }
      return map;
    });

    return children;
  }

  newArrayFetcher(state: WorldState) {
    const children = this.getChildrenCache(state);
    return {
      fetch(entity: EcsEntity) {
        return Array.from(children.retrieve().entriesForKey(entity));
      },
      cleanup() {
        children.invalidate();
      },
    };
  }

  newIterableFetcher(state: WorldState) {
    const children = this.getChildrenCache(state);
    return {
      fetch(entity: EcsEntity) {
        return children.retrieve().entriesForKey(entity);
      },
      cleanup() {
        children.invalidate();
      },
    };
  }
}

export function Children<Q extends AllParams>(
  ...qs: Q
): QueryDescriptor<Iterable<AllResults<Q>>> {
  const descriptor = new ChildrenQueryDescriptor(...qs);
  return {
    newQuery(state) {
      return descriptor.newIterableFetcher(state);
    },
  };
}

export function ChildrenArray<Q extends AllParams>(
  ...qs: Q
): QueryDescriptor<AllResults<Q>[]> {
  const descriptor = new ChildrenQueryDescriptor(...qs);
  return {
    newQuery(state) {
      return descriptor.newArrayFetcher(state);
    },
  };
}
