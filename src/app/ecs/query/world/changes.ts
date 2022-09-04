import { getOrAdd } from "@/app/utils/collections";
import { Constructor as Ctor } from "@/app/utils/types";

import {
  ChangeTicksSym,
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
type Fresh = FilterDescriptor;
type Changed = FilterDescriptor;
type Removed = FilterDescriptor;

const TrackerDescriptors = new WeakMap<Ctor, ChangeTrackers<EcsComponent>>();
const AddedDescriptors = new WeakMap<Ctor, Added>();
const FreshDescriptors = new WeakMap<Ctor, Fresh>();
const ChangedDescriptors = new WeakMap<Ctor, Changed>();
const RemovedDescriptors = new WeakMap<Ctor, Removed>();

export function ChangeTrackers<C extends EcsComponent>(
  ctor: Ctor<C>,
): ChangeTrackers<C> {
  const cache = TrackerDescriptors as WeakMap<Ctor<C>, ChangeTrackers<C>>;
  return getOrAdd(cache, ctor, newChangeTrackers);
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
          const component = archetype.get(ctor)! as C;
          const componentTicks = component[ChangeTicksSym];
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
              return component;
            },
          };
        },
      };
    },
  };
}

export function Added<C extends EcsComponent>(ctor: Ctor<C>): Added {
  return getOrAdd(AddedDescriptors, ctor, newAdded);
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
          const componentTicks = archetype.get(ctor)![ChangeTicksSym];
          return componentTicks.isAdded(ticks.last, ticks.current);
        },
      };
    },
  };
}

export function Changed<C extends EcsComponent>(ctor: Ctor<C>): Changed {
  return getOrAdd(ChangedDescriptors, ctor, newChanged);
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
          const componentTicks = archetype.get(ctor)![ChangeTicksSym];
          return componentTicks.isChanged(ticks.last, ticks.current);
        },
      };
    },
  };
}

export function Fresh<C extends EcsComponent>(ctor: Ctor<C>): Fresh {
  return getOrAdd(FreshDescriptors, ctor, newFresh);
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
          const componentTicks = archetype.get(ctor)![ChangeTicksSym];
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
  return getOrAdd(RemovedDescriptors, ctor, newRemoved);
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
