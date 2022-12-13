import { memoizer } from "@/app/utils/collections/memo";
import { Constructor as Ctor } from "@/app/utils/types";

import {
  CHANGE_TICKS,
  EcsComponent,
  inspectable,
  inspectableNames,
} from "@/app/ecs";

import { FilterDescriptor, QueryDescriptor } from "../types";

type Tracker<C extends EcsComponent> = {
  isAdded(): boolean;
  isChanged(): boolean;
  isAddedOrChanged(): boolean;
  value(): Readonly<C>;
};
type ChangeTrackers<C extends EcsComponent> = QueryDescriptor<Tracker<C>>;
type Added = FilterDescriptor;
type Changed = FilterDescriptor;
type Fresh = FilterDescriptor;
type Removed = FilterDescriptor;

const ChangeTrackersMemo = memoizer<
  Ctor<EcsComponent>,
  ChangeTrackers<EcsComponent>
>();
const AddedMemo = memoizer<Ctor<EcsComponent>, Added>();
const ChangedMemo = memoizer<Ctor<EcsComponent>, Changed>();
const FreshMemo = memoizer<Ctor<EcsComponent>, Fresh>();
const RemovedMemo = memoizer<Ctor<EcsComponent>, Removed>();

export function ChangeTrackers<C extends EcsComponent>(
  ctor: Ctor<C>,
): ChangeTrackers<C> {
  return ChangeTrackersMemo.get(ctor, newChangeTrackers) as ChangeTrackers<C>;
}
function newChangeTrackers<C extends EcsComponent>(
  ctor: Ctor<C>,
): ChangeTrackers<C> {
  return {
    inspect() {
      return inspectable(ChangeTrackers, inspectableNames([ctor]));
    },
    includes(archetype) {
      return archetype.has(ctor);
    },
    newQuery({ ticks }) {
      return {
        fetch({ archetype }) {
          const component = archetype.get(ctor)!;
          const componentTicks = component[CHANGE_TICKS];
          return {
            isAdded() {
              return componentTicks.isAdded(ticks.last, ticks.current);
            },
            isChanged() {
              return componentTicks.isChanged(ticks.last, ticks.current);
            },
            isAddedOrChanged() {
              return this.isAdded() || this.isChanged();
            },
            value() {
              return component as C;
            },
          };
        },
      };
    },
  };
}

export function Added<C extends EcsComponent>(ctor: Ctor<C>): Added {
  return AddedMemo.get(ctor, newAdded);
}

function newAdded<C extends EcsComponent>(ctor: Ctor<C>): FilterDescriptor {
  return {
    inspect() {
      return inspectable(Added, inspectableNames([ctor]));
    },
    includes(archetype) {
      return archetype.has(ctor);
    },
    newFilter({ ticks }) {
      return {
        matches({ archetype }) {
          const componentTicks = archetype.get(ctor)![CHANGE_TICKS];
          return componentTicks.isAdded(ticks.last, ticks.current);
        },
      };
    },
  };
}

export function Changed<C extends EcsComponent>(ctor: Ctor<C>): Changed {
  return ChangedMemo.get(ctor, newChanged);
}
function newChanged<C extends EcsComponent>(ctor: Ctor<C>): FilterDescriptor {
  return {
    inspect() {
      return inspectable(Changed, inspectableNames([ctor]));
    },
    includes(archetype) {
      return archetype.has(ctor);
    },
    newFilter({ ticks }) {
      return {
        matches({ archetype }) {
          const componentTicks = archetype.get(ctor)![CHANGE_TICKS];
          return componentTicks.isChanged(ticks.last, ticks.current);
        },
      };
    },
  };
}

export function Fresh<C extends EcsComponent>(ctor: Ctor<C>): Fresh {
  return FreshMemo.get(ctor, newFresh);
}

function newFresh<C extends EcsComponent>(ctor: Ctor<C>): FilterDescriptor {
  return {
    inspect() {
      return inspectable(Fresh, inspectableNames([ctor]));
    },
    includes(archetype) {
      return archetype.has(ctor);
    },
    newFilter({ ticks }) {
      return {
        matches({ archetype }) {
          const componentTicks = archetype.get(ctor)![CHANGE_TICKS];
          return (
            componentTicks.isAdded(ticks.last, ticks.current) ||
            componentTicks.isChanged(ticks.last, ticks.current)
          );
        },
      };
    },
  };
}

export function Removed<C extends EcsComponent>(ctor: Ctor<C>): Removed {
  return RemovedMemo.get(ctor, newRemoved);
}
function newRemoved<C extends EcsComponent>(ctor: Ctor<C>): FilterDescriptor {
  return {
    inspect() {
      return inspectable(Removed, inspectableNames([ctor]));
    },
    newFilter({ components }) {
      const removed = () => components.removedComponents(ctor);
      return {
        matches({ entity }) {
          return removed().has(entity);
        },
      };
    },
  };
}
