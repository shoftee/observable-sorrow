import { all, any } from "@/app/utils/collections";
import { memoizer } from "@/app/utils/collections/memo";
import { Constructor as Ctor } from "@/app/utils/types";

import { inspectableNames, inspectable, EcsComponent } from "../../types";

import { FilterDescriptor } from "../types";

type OneOrMoreCtors = [Ctor<EcsComponent>, ...Ctor<EcsComponent>[]];

type Has = FilterDescriptor;
const HasMemo = memoizer<Ctor, Has>();

export function Has(ctor: Ctor<EcsComponent>): Has {
  return HasMemo.get(ctor, newHas) as Has;
}
function newHas(ctor: Ctor): FilterDescriptor {
  return {
    inspect() {
      return inspectable(Has, inspectableNames([ctor]));
    },
    includes(archetype) {
      return archetype.has(ctor);
    },
    newFilter() {
      return {};
    },
  };
}

type HasAll = FilterDescriptor;
export function HasAll(...ctors: OneOrMoreCtors): HasAll {
  return {
    inspect() {
      return inspectable(HasAll, inspectableNames(ctors));
    },
    includes(archetype) {
      return all(ctors, (ctor) => archetype.has(ctor));
    },
    newFilter() {
      return {};
    },
  };
}

type HasAny = FilterDescriptor;
export function HasAny(...ctors: OneOrMoreCtors): HasAny {
  return {
    inspect() {
      return inspectable(HasAny, inspectableNames(ctors));
    },
    includes(archetype) {
      return any(ctors, (ctor) => archetype.has(ctor));
    },
    newFilter() {
      return {};
    },
  };
}

type HasNone = FilterDescriptor;
export function HasNone(...ctors: OneOrMoreCtors): HasNone {
  return {
    inspect() {
      return inspectable(HasNone, inspectableNames(ctors));
    },
    includes(archetype) {
      return all(ctors, (ctor) => !archetype.has(ctor));
    },
    newFilter() {
      return {};
    },
  };
}

type Predicate = FilterDescriptor;
export function Predicate<C extends EcsComponent>(
  ctor: Ctor<C>,
  predicate: (component: C) => boolean,
): Predicate {
  return {
    inspect() {
      return inspectable(Predicate, inspectableNames([ctor]));
    },
    includes(archetype) {
      return archetype.has(ctor);
    },
    newFilter() {
      return {
        matches({ archetype }) {
          return predicate(archetype.get(ctor)! as C);
        },
      };
    },
  };
}
