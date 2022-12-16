import { EcsEntity, Archetype } from "../types";
import {
  Descriptor,
  InferQueryResult,
  isQueryDescriptor,
  QueryDescriptor,
  WorldQuery,
} from "../query/types";
import { World } from "../world";

import { ComponentState } from "./components";
import { getOrAdd, MultiMap } from "@/app/utils/collections";

export class QueryState {
  private readonly fetches = new Map<Descriptor, FetchState>();
  private readonly topology = new MultiMap<Descriptor, Descriptor>();
  private readonly components: ComponentState;

  private epoch = 0;

  constructor(private readonly world: World) {
    this.components = world.components;
  }

  notifyChanged(...entities: EcsEntity[]) {
    if (entities.length === 0) {
      return;
    }

    const newEpoch = ++this.epoch;
    for (const [descriptor] of this.topology) {
      this.notifyChangedRecursive(newEpoch, entities, descriptor);
    }
  }

  private notifyChangedRecursive(
    epoch: number,
    entities: EcsEntity[],
    descriptor: Descriptor,
  ) {
    for (const dependency of this.topology.entriesForKey(descriptor)) {
      this.notifyChangedRecursive(epoch, entities, dependency);
    }

    const fetch = this.fetches.get(descriptor)!;
    fetch.notify(epoch, entities);
  }

  register(descriptor: Descriptor) {
    const deps = Array.from(descriptor.dependencies?.() ?? []);
    for (const dep of deps) {
      this.register(dep);
    }
    const fetch = getOrAdd(this.fetches, descriptor, (key) => {
      if (deps.length > 0) {
        this.topology.addAll(descriptor, deps);
      }
      return new FetchState(
        key,
        (entity) => this.components.archetype(entity),
        isQueryDescriptor(key) ? key.newQuery(this.world) : undefined,
      );
    });

    fetch.notify(this.epoch, this.components.entities());
  }

  get<Q extends QueryDescriptor>(
    descriptor: Q,
  ): FetchCache<InferQueryResult<Q>> {
    const fetch = this.fetches.get(descriptor);
    if (fetch === undefined) {
      throw new Error("Query is not registered.");
    }
    return fetch as FetchCache<InferQueryResult<Q>>;
  }

  registerAndGet<Q extends QueryDescriptor>(
    descriptor: Q,
  ): FetchCache<InferQueryResult<Q>> {
    if (!this.fetches.has(descriptor)) {
      this.register(descriptor);
    }
    return this.get(descriptor);
  }
}

export interface FetchCache<F> {
  entries(): IterableIterator<[EcsEntity, F]>;
  values(): IterableIterator<F>;
  get(entity: EcsEntity): F | undefined;
  has(entity: EcsEntity): boolean;
  cleanup(): void;
}

class FetchState<Result = unknown> {
  private readonly entities = new Set<EcsEntity>();

  private epoch?: number;

  constructor(
    private readonly descriptor: Descriptor,
    private readonly getArchetype: (entity: EcsEntity) => Archetype,
    private readonly query?: WorldQuery<Result>,
  ) {}

  notify(epoch: number, entities: Iterable<EcsEntity>) {
    if (this.epoch == epoch) {
      return;
    }

    for (const entity of entities) {
      const archetype = this.getArchetype(entity);
      if (
        archetype.size === 0 ||
        !(this.descriptor.includes?.(archetype) ?? true)
      ) {
        this.entities.delete(entity);
      } else {
        this.entities.add(entity);
      }
    }

    this.epoch = epoch;
  }

  *entries(): IterableIterator<[EcsEntity, Result]> {
    for (const entity of this.entities) {
      const ctx = { entity, archetype: this.getArchetype(entity) };
      if (this.query!.matches?.(ctx) ?? true) {
        yield [entity, this.query!.fetch(ctx)];
      }
    }
  }

  *values(): IterableIterator<Result> {
    for (const [, value] of this.entries()) {
      yield value;
    }
  }

  get(entity: EcsEntity): Result | undefined {
    if (this.entities.has(entity)) {
      const ctx = { entity, archetype: this.getArchetype(entity) };
      if (this.query!.matches?.(ctx) ?? true) {
        return this.query!.fetch(ctx);
      }
    }
    return undefined;
  }

  has(entity: EcsEntity): boolean {
    if (this.entities.has(entity)) {
      const ctx = { entity, archetype: this.getArchetype(entity) };
      return this.query!.matches?.(ctx) ?? true;
    } else {
      return false;
    }
  }

  cleanup() {
    this.query!.cleanup?.();
  }
}
