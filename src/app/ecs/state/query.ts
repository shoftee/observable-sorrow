import { EcsEntity, Archetype } from "../types";

import { QueryDescriptor, InstantiatedQuery } from "../query/types";
import { ComponentState } from "./components";
import { World } from "../world";

type QueryResult<T = unknown> = T extends QueryDescriptor<infer R> ? R : never;

export class QueryState {
  private readonly fetches = new Map<QueryDescriptor, FetchCache>();
  private generation = 0;

  constructor(
    private readonly components: ComponentState,
    private readonly world: World,
  ) {}

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
      throw new Error("Query already registered.");
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
  private readonly query;
  private readonly entries = new Map<EcsEntity, CachedResult>();

  constructor(query: InstantiatedQuery<F>) {
    this.query = {
      fetch: query.fetch,
      includes: query.includes ?? (() => true),
      matches: query.matches ?? (() => true),
      cleanup: query.cleanup ?? (() => undefined),
    };
  }

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

  *results(): Iterable<F> {
    for (const [entity, { archetype }] of this.entries) {
      const ctx = { entity, archetype };
      if (this.query.matches(ctx)) {
        yield this.query.fetch(ctx);
      }
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
