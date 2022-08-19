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

type WorldQueryResult<T = unknown> = T extends QueryDescriptor<infer R>
  ? R
  : never;

type EcsCommand = (world: World) => Iterable<EcsEntity>;

export class WorldState {
  private readonly fetches = new Map<QueryDescriptor, FetchCache>();
  private readonly commands = new Queue<EcsCommand>();
  private generation = 0;

  constructor(readonly world: World) {}

  notifyChanged(...entities: EcsEntity[]) {
    const newGeneration = ++this.generation;
    for (const entity of entities) {
      const row = this.world.archetype(entity);
      for (const [, fetch] of this.fetches) {
        fetch.notify(newGeneration, entity, row);
      }
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

  defer(command: EcsCommand) {
    this.commands.enqueue(command);
  }

  flush() {
    const entities = new Set<EcsEntity>();

    let command;
    while ((command = this.commands.dequeue())) {
      for (const entity of command(this.world)) {
        entities.add(entity);
      }
    }

    this.notifyChanged(...entities);
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
      includes: query.includes ?? ((_: Archetype) => true),
      matches: query.matches ?? ((_: Archetype) => true),
      cleanup: query.cleanup ?? (() => undefined),
    };
  }

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
    for (const [entity, { archetype }] of this.entries) {
      if (this.query.matches(archetype)) {
        yield this.query.fetch(entity, archetype);
      }
    }
  }

  get(entity: EcsEntity): F | undefined {
    const entry = this.entries.get(entity);
    if (entry && this.query.matches(entry.archetype)) {
      return this.query.fetch(entity, entry.archetype);
    }
    return undefined;
  }

  has(entity: EcsEntity): boolean {
    const entry = this.entries.get(entity);
    if (entry && this.query.matches(entry.archetype)) {
      return true;
    }
    return false;
  }

  cleanup() {
    this.query.cleanup();
  }
}
