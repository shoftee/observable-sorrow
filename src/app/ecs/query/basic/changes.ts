import { Constructor as Ctor } from "@/app/utils/types";

import { ChangeTicks, EcsComponent } from "@/app/ecs";
import {
  defaultFilter,
  defaultQuery,
  FilterDescriptor,
  QueryDescriptor,
} from "../types";

type Tracker<C extends EcsComponent> = {
  isAdded(): boolean;
  isChanged(): boolean;
  isAddedOrChanged(): boolean;
  value(): Readonly<C>;
};

type ChangeTrackers<C extends EcsComponent> = QueryDescriptor<Tracker<C>>;
export function ChangeTrackers<C extends EcsComponent>(
  ctor: Ctor<C>,
): ChangeTrackers<C> {
  return {
    newQuery({ ticks }) {
      return defaultQuery({
        includes({ archetype }) {
          return archetype.has(ctor);
        },
        fetch({ archetype }) {
          const component = archetype.get(ctor)!;
          return createTracker(component as C, ticks.last, ticks.current);
        },
      });
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
    newFilter({ ticks }) {
      return defaultFilter({
        includes({ archetype }) {
          return archetype.has(ctor);
        },
        matches({ archetype }) {
          const component = archetype.get(ctor)!;
          return component[ChangeTicks].isAdded(ticks.last, ticks.current);
        },
      });
    },
  };
}

type Changed = FilterDescriptor;
export function Changed<C extends EcsComponent>(ctor: Ctor<C>): Changed {
  return {
    newFilter({ ticks }) {
      return defaultFilter({
        includes({ archetype }) {
          return archetype.has(ctor);
        },
        matches({ archetype }) {
          const component = archetype.get(ctor)!;
          return component[ChangeTicks].isChanged(ticks.last, ticks.current);
        },
      });
    },
  };
}
