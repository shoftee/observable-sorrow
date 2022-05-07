import { all } from "@/app/utils/collections";
import { Constructor as Ctor } from "@/app/utils/types";

import { WorldQuery, WorldQueryFilter } from ".";
import { Archetype, EcsComponent, EcsEntity } from "../world";

export type AllParams = [...WorldQuery[]];
export type AllResults<T> = T extends [infer Head, ...infer Tail]
  ? [...UnwrapResult<Head>, ...AllResults<Tail>]
  : [];
type UnwrapResult<T> = T extends WorldQuery<infer Fetch>
  ? [...UnwrapResult<Fetch>]
  : [T];

export type Filters = [...WorldQueryFilter[]];

class AllQuery<Q extends AllParams> extends WorldQuery<AllResults<Q>> {
  private filters: Filters | undefined;

  constructor(private readonly queries: Q) {
    super();
  }

  match(archetype: Archetype<EcsComponent>): boolean {
    for (const filter of this.iterateFilters()) {
      if (!filter.match(archetype)) {
        return false;
      }
    }
    return true;
  }

  private *iterateFilters(): Iterable<WorldQueryFilter> {
    yield* this.queries;
    if (this.filters) {
      yield* this.filters;
    }
  }

  fetch(entity: EcsEntity, archetype: Archetype<EcsComponent>): AllResults<Q> {
    // TODO: Determine whether this array allocation is necessary.
    // Broken tests don't necessarily reflect real usage.
    return this.queries.map((q) => q.fetch(entity, archetype)) as AllResults<Q>;
  }

  filter<F extends Filters>(...filters: F): AllQuery<Q> {
    this.filters = filters;
    return this;
  }
}

/** Includes results only when they match all provided sub-queries. */
export function All<Q extends AllParams>(...qs: Q): AllQuery<Q> {
  return new AllQuery(qs);
}

// [Component1, Component2,...] => [Ctor<Component1>, Ctor<Component2>,...]
type FilterTuple = [...Ctor<EcsComponent>[]];

class WithFilter<T extends FilterTuple> implements WorldQueryFilter {
  private readonly ctors: T;
  constructor(...ctors: T) {
    this.ctors = ctors;
  }

  match(archetype: Archetype): boolean {
    return all(this.ctors, (ctor) => archetype.has(ctor));
  }
}

export function With<T extends FilterTuple>(...ctors: T): WithFilter<T> {
  return new WithFilter(...ctors);
}

class WithoutFilter<T extends FilterTuple> implements WorldQueryFilter {
  private readonly ctors: T;
  constructor(...ctors: T) {
    this.ctors = ctors;
  }

  match(archetype: Archetype): boolean {
    return all(this.ctors, (ctor) => !archetype.has(ctor));
  }
}

export function Without<T extends FilterTuple>(...ctors: T): WithoutFilter<T> {
  return new WithoutFilter(...ctors);
}
