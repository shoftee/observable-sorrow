import { EcsEntity, Archetype } from "../types";
import { EntityQueryFactory, EntityQuery } from "../query/types";
import { World } from "../world";

import { ComponentState } from "./components";

type Result<T = unknown> = T extends EntityQueryFactory<infer R> ? R : never;

export class QueryState {
  private readonly fetches = new Map<EntityQueryFactory, FetchState>();
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

  register(descriptor: EntityQueryFactory) {
    const fetches = this.fetches;
    if (fetches.has(descriptor)) {
      // query descriptors can be reused
      return;
    }

    const fetch = new FetchState(descriptor.newQuery(this.world));
    fetches.set(descriptor, fetch);
    for (const [entity, row] of this.components.archetypes()) {
      fetch.notify(this.generation, entity, row);
    }
  }

  get<Q extends EntityQueryFactory>(descriptor: Q): FetchCache<Result<Q>> {
    const fetch = this.fetches.get(descriptor);
    if (fetch === undefined) {
      throw new Error("Query is not registered.");
    }
    return fetch as FetchCache<Result<Q>>;
  }
}

type FetchCacheEntry = {
  archetype: Archetype;
  generation: number;
};

export interface FetchCache<F> {
  entries(): IterableIterator<[EcsEntity, F]>;
  values(): IterableIterator<F>;
  get(entity: EcsEntity): F | undefined;
  has(entity: EcsEntity): boolean;
  cleanup(): void;
}

class FetchState<F = unknown> {
  private readonly _entries = new Map<EcsEntity, FetchCacheEntry>();

  constructor(private readonly query: EntityQuery<F>) {}

  notify(generation: number, entity: EcsEntity, archetype: Archetype) {
    if (archetype.size === 0 || !this.query.includes({ entity, archetype })) {
      this._entries.delete(entity);
    } else {
      const result = this._entries.get(entity);
      if (result !== undefined) {
        if (result.generation !== generation) {
          result.archetype = archetype;
          result.generation = generation;
        }
      } else {
        this._entries.set(entity, { archetype, generation });
      }
    }
  }

  *entries(): IterableIterator<[EcsEntity, F]> {
    for (const [entity, { archetype }] of this._entries) {
      const ctx = { entity, archetype };
      if (this.query.matches(ctx)) {
        yield [entity, this.query.fetch(ctx)];
      }
    }
  }

  *values(): IterableIterator<F> {
    for (const [, value] of this.entries()) {
      yield value;
    }
  }

  get(entity: EcsEntity): F | undefined {
    const entry = this._entries.get(entity);
    if (entry) {
      const ctx = { entity, archetype: entry.archetype };
      if (this.query.matches(ctx)) {
        return this.query.fetch(ctx);
      }
    }
    return undefined;
  }

  has(entity: EcsEntity): boolean {
    const entry = this._entries.get(entity);
    return (
      !!entry && this.query.matches({ entity, archetype: entry.archetype })
    );
  }

  cleanup() {
    this.query.cleanup();
  }
}
