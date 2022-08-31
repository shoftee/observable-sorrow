import { cache } from "@/app/utils/cache";
import { Constructor as Ctor } from "@/app/utils/types";

import { ChangeTicksSym, EcsComponent } from "@/app/ecs";
import {
  defaultFilter,
  defaultQuery,
  EntityFilterFactory,
  EntityQueryFactory,
} from "../types";

type Tracker<C extends EcsComponent> = {
  isAdded(): boolean;
  isChanged(): boolean;
  isAddedOrChanged(): boolean;
  value(): Readonly<C>;
};

type ChangeTrackers<C extends EcsComponent> = EntityQueryFactory<Tracker<C>>;
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
      return component[ChangeTicksSym].isAdded(last, current);
    },
    isChanged(): boolean {
      return component[ChangeTicksSym].isChanged(last, current);
    },
    isAddedOrChanged(): boolean {
      return this.isAdded() || this.isChanged();
    },
    value(): C {
      return component;
    },
  };
}

type Added = EntityFilterFactory;
export function Added<C extends EcsComponent>(ctor: Ctor<C>): Added {
  return {
    newFilter({ ticks }) {
      return defaultFilter({
        includes({ archetype }) {
          return archetype.has(ctor);
        },
        matches({ archetype }) {
          const component = archetype.get(ctor)!;
          return component[ChangeTicksSym].isAdded(ticks.last, ticks.current);
        },
      });
    },
  };
}

type Changed = EntityFilterFactory;
export function Changed<C extends EcsComponent>(ctor: Ctor<C>): Changed {
  return {
    newFilter({ ticks }) {
      return defaultFilter({
        includes({ archetype }) {
          return archetype.has(ctor);
        },
        matches({ archetype }) {
          const component = archetype.get(ctor)!;
          return component[ChangeTicksSym].isChanged(ticks.last, ticks.current);
        },
      });
    },
  };
}

type AddedOrChanged = EntityFilterFactory;
export function AddedOrChanged<C extends EcsComponent>(
  ctor: Ctor<C>,
): AddedOrChanged {
  return {
    newFilter({ ticks }) {
      return defaultFilter({
        includes({ archetype }) {
          return archetype.has(ctor);
        },
        matches({ archetype }) {
          const component = archetype.get(ctor)!;
          return (
            component[ChangeTicksSym].isAdded(ticks.last, ticks.current) ||
            component[ChangeTicksSym].isChanged(ticks.last, ticks.current)
          );
        },
      });
    },
  };
}

type Removed = EntityFilterFactory;
export function Removed<C extends EcsComponent>(ctor: Ctor<C>): Removed {
  return {
    newFilter({ components }) {
      const cached = cache(() => components.removedComponents(ctor));
      return defaultFilter({
        matches({ entity }) {
          return cached.retrieve().has(entity);
        },
        cleanup() {
          cached.invalidate();
        },
      });
    },
  };
}
