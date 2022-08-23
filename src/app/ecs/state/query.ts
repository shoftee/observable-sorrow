import { EcsEntity, Archetype } from "../types";

import { QueryDescriptor, InstantiatedQuery } from "../query/types";
import { ComponentState } from "./components";
import { World } from "../world";

type QueryResult<T = unknown> = T extends QueryDescriptor<infer R> ? R : never;

export class QueryState {
  private readonly fetches = new Map<QueryDescriptor, FetchCache>();
  private readonly components: ComponentState;
  private generation = 0;

  constructor(private readonly world: World) {
    this.components = world.components;
  }

  notifyChanged(...entities: EcsEntity[]) {
    const newGeneration = ++this.generation;
    for (const entity of entities) {
      const row = this.components.archetype(entity);
      for (const [, fetch] of this.fetches) {
        fetch.notify(newGeneration, entity, row);
      }
    }
  }

  register(descriptor: QueryDescriptor) {
    const fetches = this.fetches;
    if (fetches.has(descriptor)) {
      // query descriptors can be reused
      return;
    }

    const fetch = new FetchCache(descriptor.newQuery(this.world));
    fetches.set(descriptor, fetch);
    for (const [entity, row] of this.components.archetypes()) {
      fetch.notify(this.generation, entity, row);
    }
  }

  get<Q extends QueryDescriptor>(descriptor: Q): FetchCache<QueryResult<Q>> {
    const fetch = this.fetches.get(descriptor);
    if (fetch === undefined) {
      throw new Error("Query is not registered.");
    }
    return fetch as FetchCache<QueryResult<Q>>;
  }
}

type CachedResult = {
  archetype: Archetype;
  generation: number;
};

class FetchCache<F = unknown> {
  private readonly entries = new Map<EcsEntity, CachedResult>();

  constructor(private readonly query: InstantiatedQuery<F>) {}

  notify(generation: number, entity: EcsEntity, archetype: Archetype) {
    if (archetype.size === 0 || !this.query.includes({ entity, archetype })) {
      this.entries.delete(entity);
    } else {
      const result = this.entries.get(entity);
      if (result !== undefined) {
        if (result.generation !== generation) {
          result.archetype = archetype;
          result.generation = generation;
        }
      } else {
        this.entries.set(entity, { archetype, generation });
      }
    }
  }

  *results(): IterableIterator<[EcsEntity, F]> {
    for (const [entity, { archetype }] of this.entries) {
      const ctx = { entity, archetype };
      if (this.query.matches(ctx)) {
        yield [entity, this.query.fetch(ctx)];
      }
    }
  }

  *resultValues(): IterableIterator<F> {
    for (const [, value] of this.results()) {
      yield value;
    }
  }

  get(entity: EcsEntity): F | undefined {
    const entry = this.entries.get(entity);
    if (entry) {
      const ctx = { entity, archetype: entry.archetype };
      if (this.query.matches(ctx)) {
        return this.query.fetch(ctx);
      }
    }
    return undefined;
  }

  has(entity: EcsEntity): boolean {
    const entry = this.entries.get(entity);
    return (
      !!entry && this.query.matches({ entity, archetype: entry.archetype })
    );
  }

  cleanup() {
    this.query.cleanup();
  }
}
