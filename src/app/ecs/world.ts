import { Queue } from "queue-typescript";

import { Constructor as Ctor, getConstructorOf } from "@/app/utils/types";
import { TypeSet, Table } from "@/app/utils/collections";

import { InstantiatedQuery, QueryDescriptor } from "./query/types";
import {
  Archetype,
  ChangeTicks,
  ComponentTicks,
  EcsComponent,
  EcsEntity,
  EcsEvent,
  EcsResource,
  EntityType,
  SystemTicks,
} from "./types";

export class World {
  private readonly entities = new Set<EcsEntity>();
  private readonly components = new Table<
    EcsEntity,
    Ctor<EcsComponent>,
    EcsComponent
  >();
  private readonly resources = new TypeSet<EcsResource>();
  private readonly eventQueues = new Map<Ctor<EcsEvent>, Queue<EcsEvent>>();

  readonly ticks = new SystemTicks();

  private newEntityId = 1;

  spawn(...components: EcsComponent[]): EcsEntity {
    const entity = Object.freeze({ [EntityType]: this.newEntityId++ });
    this.entities.add(entity);
    this.insertComponents(entity, ...components);
    return entity;
  }

  despawn(entity: EcsEntity) {
    this.components.removeRow(entity);
    this.entities.delete(entity);
  }

  insertComponents(entity: EcsEntity, ...components: EcsComponent[]): void {
    const added = this.ticks.advance();
    for (const component of components) {
      component[ChangeTicks] = new ComponentTicks(added);
      const ctor = getConstructorOf(component);
      this.components.add(entity, ctor, (exists) => {
        if (exists) {
          throw new Error(`Entity already has component of type ${ctor}.`);
        }
        return component;
      });
    }
  }

  removeComponents(entity: EcsEntity, ...ctors: Ctor<EcsComponent>[]): void {
    for (const ctor of ctors) {
      this.components.removeCell(entity, ctor);
    }
  }

  archetype(entity: EcsEntity): Archetype {
    return this.components.row(entity);
  }

  *archetypes(): Iterable<[EcsEntity, Archetype]> {
    yield* this.components.rows();
  }

  insertResource<R extends EcsResource>(resource: R): void {
    this.resources.add(resource);
  }

  resource<R extends EcsResource>(ctor: Ctor<R>): R | undefined {
    return this.resources.get(ctor);
  }

  registerEvent<E extends EcsEvent>(ctor: Ctor<E>) {
    const events = this.eventQueues;
    if (events.has(ctor)) {
      throw new Error("Event already registered.");
    }
    events.set(ctor, new Queue<E>());
  }

  events<E extends EcsEvent>(ctor: Ctor<E>): Queue<E> {
    const queue = this.eventQueues.get(ctor);
    if (queue === undefined) {
      throw new Error("Event not registered.");
    }
    return queue as Queue<E>;
  }
}

type WorldCommand = () => void;
type WorldQueryResult<T = unknown> = T extends QueryDescriptor<infer R>
  ? R
  : never;

export class WorldState {
  private generation = 0;
  private readonly fetches = new Map<QueryDescriptor, FetchCache>();

  constructor(readonly world: World) {}

  private readonly commands = new Queue<WorldCommand>();

  spawn(...components: EcsComponent[]): EcsEntity {
    const entity = this.world.spawn(...components);

    this.notifyChanged(entity);

    return entity;
  }

  despawn(entity: EcsEntity): void {
    this.world.despawn(entity);

    this.notifyChanged(entity);
  }

  insertComponents(entity: EcsEntity, ...components: EcsComponent[]): void {
    this.world.insertComponents(entity, ...components);

    this.notifyChanged(entity);
  }

  private notifyChanged(entity: EcsEntity) {
    const newGeneration = this.generation++;
    const row = this.world.archetype(entity);
    for (const [, fetch] of this.fetches) {
      fetch.notify(newGeneration, entity, row);
    }
  }

  addQuery(descriptor: QueryDescriptor) {
    const fetches = this.fetches;
    if (fetches.has(descriptor)) {
      throw new Error("Query already registered.");
    }
    const fetch = new FetchCache(descriptor.newQuery(this));
    fetches.set(descriptor, fetch);
    for (const [entity, row] of this.world.archetypes()) {
      fetch.notify(this.generation, entity, row);
    }
  }

  fetchQuery<Q extends QueryDescriptor>(
    query: Q,
  ): FetchCache<WorldQueryResult<Q>> {
    const fetch = this.fetches.get(query);
    if (fetch === undefined) {
      throw new Error("Query is not registered.");
    }
    return fetch as FetchCache<WorldQueryResult<Q>>;
  }

  insertResource<R extends EcsResource>(resource: R) {
    this.world.insertResource(resource);
  }

  registerEvent<E extends EcsEvent>(ctor: Ctor<E>) {
    this.world.registerEvent(ctor);
  }

  insertComponentsDeferred(entity: EcsEntity, ...components: EcsComponent[]) {
    this.commands.enqueue(() => this.insertComponents(entity, ...components));
  }

  despawnDeferred(entity: EcsEntity) {
    this.commands.enqueue(() => {
      this.despawn(entity);
    });
  }

  flushDeferred() {
    let command;
    while ((command = this.commands.dequeue())) {
      command();
    }
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
    if (archetype.size === 0 || !this.query.includes(archetype)) {
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
    const { fetch, matches } = this.query;
    for (const [entity, { archetype }] of this.entries) {
      if (matches?.(archetype) ?? true) {
        yield fetch(entity, archetype);
      }
    }
  }

  get(entity: EcsEntity): F | undefined {
    const { fetch, matches } = this.query;
    const entry = this.entries.get(entity);
    if (entry) {
      if (!matches || matches(entry.archetype)) {
        return fetch(entity, entry.archetype);
      }
    }
    return undefined;
  }
}
