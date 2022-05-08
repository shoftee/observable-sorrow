import { Constructor as Ctor } from "@/app/utils/types";

import {
  Archetype,
  ChangeTicks,
  EcsComponent,
  EcsEntity,
  WorldState,
} from "@/app/ecs";
import { FilterDescriptor, QueryDescriptor } from "../types";

type Tracker<C extends EcsComponent> = {
  isAdded(): boolean;
  isChanged(): boolean;
  value(): C;
};

type ChangeTrackersQuery<C extends EcsComponent> = QueryDescriptor<Tracker<C>>;
export function ChangeTrackers<C extends EcsComponent>(
  ctor: Ctor<C>,
): ChangeTrackersQuery<C> {
  return {
    newQuery(state: WorldState) {
      return {
        includes: (archetype: Archetype) => {
          return archetype.has(ctor);
        },
        fetch: (_: EcsEntity, archetype: Archetype<C>) => {
          const component = archetype.get(ctor)!;
          const { last, current } = state.world.ticks;
          return {
            isAdded(): boolean {
              return component[ChangeTicks].isAdded(last, current);
            },
            isChanged(): boolean {
              return component[ChangeTicks].isChanged(last, current);
            },
            value(): C {
              return component;
            },
          };
        },
      };
    },
  };
}

type AddedFilter = FilterDescriptor;
export function Added<C extends EcsComponent>(ctor: Ctor<C>): AddedFilter {
  return {
    newFilter(state: WorldState) {
      return {
        includes: (archetype: Archetype) => {
          return archetype.has(ctor);
        },
        matches: (archetype: Archetype) => {
          const component = archetype.get(ctor);
          if (component !== undefined) {
            const { last, current } = state.world.ticks;
            return component[ChangeTicks].isAdded(last, current);
          } else {
            return false;
          }
        },
      };
    },
  };
}

type ChangedFilter = FilterDescriptor;
export function Changed<C extends EcsComponent>(ctor: Ctor<C>): ChangedFilter {
  return {
    newFilter(state: WorldState) {
      return {
        includes: (archetype: Archetype) => {
          return archetype.has(ctor);
        },
        matches: (archetype: Archetype) => {
          const component = archetype.get(ctor);
          if (component !== undefined) {
            const { last, current } = state.world.ticks;
            return component[ChangeTicks].isChanged(last, current);
          } else {
            return false;
          }
        },
      };
    },
  };
}
