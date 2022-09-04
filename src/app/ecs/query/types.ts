import { Constructor as Ctor } from "@/app/utils/types";

import { Archetype, EcsComponent, EcsEntity, Inspectable } from "../types";
import { World } from "../world";

/**
 * A generic interface for querying the world state for component data.
 *
 * Usage:
 * 1. Call includes(). If returned value was false, skip query item and restart with next.
 * 2. Call matches(). If returned value was false, skip query item and restart with next.
 * 3. Call fetch() to get query results.
 *
 * There are four basic kinds of world queries:
 * * Entity - ask for the entity for a given WQ result.
 * * Value(Component) - returns the value field of a ValueComponent<T>
 * * Ref(Component) - returns read-only view of a component.
 * * Mut(Component) - returns component view with change tracking.
 * * Opt(WorldQuery) - wrapper for making other world queries optional.
 *
 * Combine any of the above with this:
 * * All(WorldQuery_1, WorldQuery_2, WorldQuery_3,...) - returns an iterator over all component tuples that match the provided world queries
 * * Map([ValueComponent query], [any WorldQuery]) - returns a map keyed by the provided value component and valued with the result from the provided world query. Can be combined with All().
 *
 * Filters:
 * * With(C1, C2, C3...) - include results that have all of the specified components present. This behavior is similar to requesting them in an All query, but doesn't fetch the data for the components.
 * * Without(C1, C2, C3...) - exclude results that have the specified components present.
 * * Added(C) - match only query items when C was added to the entity since the last system execution.
 * * Changed(C) - match only query items when C was changed since the last system execution.
 *
 * Other:
 * * ChangeTrackers(C) - return the change tracking information for C, can be used to determine if C was added or changed since the last system execution. Cannot be used for removal detection.
 */

export type FetchContext<C extends EcsComponent = EcsComponent> = {
  entity: EcsEntity;
  archetype: Archetype<C>;
};

export interface WorldFilter {
  matches?(ctx: FetchContext): boolean;
  cleanup?(): void;
}

export interface WorldQuery<Result> extends WorldFilter {
  fetch(ctx: FetchContext): Result;
}

export interface Descriptor extends Inspectable {
  includes?(archetype: Archetype): boolean;
  dependencies?(): Iterable<Descriptor>;
}

export interface FilterDescriptor extends Descriptor {
  newFilter(world: World): WorldFilter;
}

export function isFilterDescriptor(d: Descriptor): d is FilterDescriptor {
  return (d as FilterDescriptor).newFilter !== undefined;
}

export interface QueryDescriptor<Result = unknown> extends Descriptor {
  newQuery(world: World): WorldQuery<Result>;
}

export function isQueryDescriptor<R = unknown>(
  d: Descriptor,
): d is QueryDescriptor<R> {
  return (d as QueryDescriptor<R>).newQuery !== undefined;
}

export type QueryTuple<F> = F extends [infer Head, ...infer Tail]
  ? [...UnwrapQueryDescriptor<Head>, ...QueryTuple<Tail>]
  : [];
type UnwrapQueryDescriptor<T> = T extends QueryDescriptor<infer Result>
  ? [Result]
  : [T];

export type SystemParameter<Result = unknown> = {
  fetch(): Result;
  cleanup?(): void;
};

export type SystemParamDescriptor<Result = unknown> = Inspectable & {
  create(world: World): SystemParameter<Result>;
};

export type OneOrMoreCtors = [Ctor<EcsComponent>, ...Ctor<EcsComponent>[]];

export type OneOrMoreFilters = [FilterDescriptor, ...FilterDescriptor[]];
