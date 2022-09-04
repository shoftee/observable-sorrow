import { all, any } from "@/app/utils/collections";

import { inspectableNames, inspectable } from "../../types";

import { FilterDescriptor, OneOrMoreCtors } from "../types";

type Has = FilterDescriptor;
export function Has(...ctors: OneOrMoreCtors): Has {
  return {
    inspect() {
      return inspectable(Has, inspectableNames(ctors));
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
