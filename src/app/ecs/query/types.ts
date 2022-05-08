import { Archetype, EcsEntity, WorldState } from "../world";

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
 * * Ref(Component) - returns read-only view of a component.
 * * Mut(Component) - returns component view with change tracking.
 * * Opt(WorldQuery) - wrapper for making other world queries optional.
 *
 * Combine any of the above with this:
 * * All(WorldQuery_1, WorldQuery_2, WorldQuery_3,...)
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

export interface InstantiatedFilter {
  includes(archetype: Archetype): boolean;
  matches?(archetype: Archetype): boolean;
}

export interface InstantiatedQuery<F> extends InstantiatedFilter {
  fetch(entity: EcsEntity, archetype: Archetype): F;
}

export abstract class FilterDescriptor {
  abstract newFilter(state: WorldState): InstantiatedFilter;
}

export abstract class QueryDescriptor<Fetch = unknown> {
  abstract newQuery(state: WorldState): InstantiatedQuery<Fetch>;
}
