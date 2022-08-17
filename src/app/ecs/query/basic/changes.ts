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
  isAddedOrChanged(): boolean;
  value(): C;
};

type ChangeTrackers<C extends EcsComponent> = QueryDescriptor<Tracker<C>>;

export function ChangeTrackers<C extends EcsComponent>(
  ctor: Ctor<C>,
): ChangeTrackers<C> {
  return {
    newQuery(state: WorldState) {
      return {
        includes: (archetype: Archetype) => {
          return archetype.has(ctor);
        },
        fetch: (_: EcsEntity, archetype: Archetype<C>) => {
          const component = archetype.get(ctor)!;
          const { last, current } = state.world.ticks;
          return createTracker(component, last, current);
        },
      };
    },
  };
}

function createTracker<C extends EcsComponent>(
  component: C,
  last: number,
  current: number,
): Tracker<C> {
  return {
    isAdded(): boolean {
      return component[ChangeTicks].isAdded(last, current);
    },
    isChanged(): boolean {
      return component[ChangeTicks].isChanged(last, current);
    },
    isAddedOrChanged(): boolean {
      return this.isAdded() || this.isChanged();
    },
    value(): C {
      return component;
    },
  };
}

type Added = FilterDescriptor;
export function Added<C extends EcsComponent>(ctor: Ctor<C>): Added {
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

type Changed = FilterDescriptor;
export function Changed<C extends EcsComponent>(ctor: Ctor<C>): Changed {
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
