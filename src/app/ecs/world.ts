import { Queue } from "queue-typescript";

import { Constructor as Ctor, getConstructorOf } from "@/app/utils/types";
import { TypeSet, Table } from "@/app/utils/collections";

import { WorldQuery } from "./query";

export const EntityType = Symbol.for("Entity");
export class EcsEntity {
  [EntityType]: number;
}

export const ComponentType = Symbol.for("Component");
export abstract class EcsComponent {
  protected [ComponentType]: true;
}

export const ResourceType = Symbol.for("Resource");
export abstract class EcsResource {
  protected [ResourceType]: true;
}

export const EventType = Symbol.for("Event");
export abstract class EcsEvent {
  protected [EventType]: true;
}

export type ComponentCtor<C extends EcsComponent = EcsComponent> = Ctor<C>;

export type Archetype<C extends EcsComponent = EcsComponent> = ReadonlyMap<
  ComponentCtor<C>,
  C
>;

export interface IQuery {
  notify(entity: EcsEntity, archetype: Archetype): void;
}

export class World {
  private readonly entities = new Set<EcsEntity>();
  private readonly components = new Table<
    EcsEntity,
    ComponentCtor,
    EcsComponent
  >();
  private readonly resources = new TypeSet<EcsResource>();
  private readonly eventQueues = new Map<Ctor<EcsEvent>, Queue<EcsEvent>>();

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
    for (const component of components) {
      const ctor = getConstructorOf(component);
      this.components.add(entity, ctor, (exists) => {
        if (exists) {
          throw new Error(`Entity already has compnent of type ${ctor}`);
        }
        return component;
      });
    }
  }

  removeComponents(entity: EcsEntity, ...ctors: ComponentCtor[]): void {
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
    if (this.eventQueues.has(ctor)) {
      throw new Error("Event already registered");
    }
    this.eventQueues.set(ctor, new Queue<E>());
  }

  events<E extends EcsEvent>(ctor: Ctor<E>): Queue<E> {
    const queue = this.eventQueues.get(ctor);
    if (queue === undefined) {
      throw new Error("Event not registered");
    }
    return queue as Queue<E>;
  }
}

type WorldCommand = (world: World) => void;
type WorldQueryResult<T = unknown> = T extends WorldQuery<infer R> ? R : never;

export class WorldState {
  private generation = 0;
  private readonly fetches = new Map<WorldQuery, FetchCache>();

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

  addQuery(query: WorldQuery) {
    if (this.fetches.has(query)) {
      throw new Error("Query already registered.");
    }

    const fetch = new FetchCache(query);
    this.fetches.set(query, fetch);
    for (const [entity, row] of this.world.archetypes()) {
      fetch.notify(this.generation, entity, row);
    }
  }

  fetchQuery<Q extends WorldQuery>(query: Q): Iterable<WorldQueryResult<Q>> {
    const fetch = this.fetches.get(query);
    if (fetch === undefined) {
      throw new Error("Query is not registered.");
    }
    return fetch.results() as Iterable<WorldQueryResult<Q>>;
  }

  insertResource<R extends EcsResource>(resource: R) {
    this.world.insertResource(resource);
  }

  registerEvent<E extends EcsEvent>(ctor: Ctor<E>) {
    this.world.registerEvent(ctor);
  }

  insertComponentsDeferred(entity: EcsEntity, ...components: EcsComponent[]) {
    this.commands.enqueue((world) =>
      world.insertComponents(entity, ...components),
    );
  }

  despawnDeferred(entity: EcsEntity) {
    this.commands.enqueue((world) => {
      world.despawn(entity);
    });
  }

  flushDeferred() {
    let command;
    while ((command = this.commands.dequeue())) {
      command(this.world);
    }
  }
}

class FetchCache<F = unknown> {
  private readonly descriptors = new Map<EcsEntity, CachedQueryResult>();

  constructor(private readonly query: WorldQuery<F>) {}

  notify(generation: number, entity: EcsEntity, archetype: Archetype) {
    if (archetype.size === 0 || !this.query.match(archetype)) {
      this.descriptors.delete(entity);
    } else {
      const result = this.descriptors.get(entity);
      if (result !== undefined) {
        if (result.generation !== generation) {
          result.generation = generation;
          result.archetype = archetype;
        }
      } else {
        this.descriptors.set(
          entity,
          new CachedQueryResult(entity, archetype, generation),
        );
      }
    }
  }

  *results(): Iterable<F> {
    for (const [entity, result] of this.descriptors) {
      yield this.query.fetch(entity, result.archetype);
    }
  }
}

class CachedQueryResult {
  constructor(
    readonly entity: EcsEntity,
    public archetype: Archetype,
    public generation: number,
  ) {}
}
