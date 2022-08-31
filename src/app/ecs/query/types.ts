import { Archetype, EcsComponent, EcsEntity } from "../types";
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

export interface EntityFilter {
  includes(ctx: FetchContext): boolean;
  matches(ctx: FetchContext): boolean;
  cleanup(): void;
}

export interface EntityQuery<Result> extends EntityFilter {
  fetch(ctx: FetchContext): Result;
}

function alwaysTrue() {
  return true;
}
function noOp() {
  return;
}

export function defaultFilter(inner: Partial<EntityFilter>): EntityFilter {
  inner.includes ?? (inner.includes = alwaysTrue);
  inner.matches ?? (inner.matches = alwaysTrue);
  inner.cleanup ?? (inner.cleanup = noOp);
  return inner as EntityFilter;
}

export function defaultQuery<Result>(
  inner: Partial<EntityQuery<Result>>,
): EntityQuery<Result> {
  defaultFilter(inner);
  return inner as EntityQuery<Result>;
}

export abstract class EntityFilterFactory {
  abstract newFilter(world: World): EntityFilter;
}

export abstract class EntityQueryFactory<Result = unknown> {
  abstract newQuery(world: World): EntityQuery<Result>;
}

export type EntityQueryFactoryTuple = [...EntityQueryFactory[]];
export type EntityFilterFactoryTuple = [...EntityFilterFactory[]];

export type EntityQueryResultTuple<F> = F extends [infer Head, ...infer Tail]
  ? [...UnwrapFactory<Head>, ...EntityQueryResultTuple<Tail>]
  : [];
type UnwrapFactory<T> = T extends EntityQueryFactory<infer Result>
  ? [Result]
  : [T];

export type WorldQuery<Result = unknown> = {
  fetch(): Result;
  cleanup?(): void;
};

export type WorldQueryFactory<Result = unknown> = {
  create(world: World): WorldQuery<Result>;
};

export type WorldQueryFactoryTuple = [...WorldQueryFactory[]];

export type WorldQueryTuple<F> = F extends [infer Head, ...infer Tail]
  ? [...UnwrapWorldQueryFactory<Head>, ...WorldQueryTuple<Tail>]
  : [];
type UnwrapWorldQueryFactory<F> = F extends WorldQueryFactory<infer T>
  ? [T]
  : [];
