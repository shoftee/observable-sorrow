import { Queue } from "queue-typescript";

import { Constructor, getConstructorOf } from "@/app/utils/types";
import { TypeSet, Table } from "@/app/utils/collections";

import { WorldQuery } from "./query";

export const EntityType = Symbol.for("Entity");
export class Entity {
  [EntityType]: number;
}

export const ComponentType = Symbol.for("Component");
export abstract class Component {
  protected [ComponentType]: true;
}

export const ResourceType = Symbol.for("Resource");
export abstract class Resource {
  protected [ResourceType]: true;
}

export const EventType = Symbol.for("Event");
export abstract class Event {
  protected [EventType]: true;
}

export type ComponentCtor<C extends Component = Component> = Constructor<C>;

export type Archetype<C extends Component = Component> = ReadonlyMap<
  ComponentCtor<C>,
  C
>;

export interface IQuery {
  notify(entity: Entity, archetype: Archetype): void;
}

export class World {
  private readonly entities = new Set<Entity>();
  private readonly components = new Table<Entity, ComponentCtor, Component>();
  private readonly resources = new TypeSet<Resource>();
  private readonly eventQueues = new Map<Constructor<Event>, Queue<Event>>();

  private newEntityId = 1;

  spawn(...components: Component[]): Entity {
    const entity = Object.freeze({ [EntityType]: this.newEntityId++ });
    this.entities.add(entity);
    this.insertComponents(entity, ...components);
    return entity;
  }

  despawn(entity: Entity) {
    this.components.removeRow(entity);
    this.entities.delete(entity);
  }

  insertComponents(entity: Entity, ...components: Component[]): void {
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

  removeComponents(entity: Entity, ...ctors: ComponentCtor[]): void {
    for (const ctor of ctors) {
      this.components.removeCell(entity, ctor);
    }
  }

  archetype(entity: Entity): Archetype {
    return this.components.row(entity);
  }

  *archetypes(): Iterable<[Entity, Archetype]> {
    yield* this.components.rows();
  }

  insertResource<R extends Resource>(resource: R): void {
    this.resources.add(resource);
  }

  resource<R extends Resource>(ctor: Constructor<R>): R | undefined {
    return this.resources.get(ctor);
  }

  registerEvent<E extends Event>(ctor: Constructor<E>) {
    if (this.eventQueues.has(ctor)) {
      throw new Error("Event already registered");
    }
    this.eventQueues.set(ctor, new Queue<E>());
  }

  events<E extends Event>(ctor: Constructor<E>): Queue<E> {
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

  spawn(...components: Component[]): Entity {
    const entity = this.world.spawn(...components);

    this.notifyChanged(entity);

    return entity;
  }

  despawn(entity: Entity): void {
    this.world.despawn(entity);

    this.notifyChanged(entity);
  }

  insertComponents(entity: Entity, ...components: Component[]): void {
    this.world.insertComponents(entity, ...components);

    this.notifyChanged(entity);
  }

  private notifyChanged(entity: Entity) {
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

  insertResource<R extends Resource>(resource: R) {
    this.world.insertResource(resource);
  }

  registerEvent<E extends Event>(ctor: Constructor<E>) {
    this.world.registerEvent(ctor);
  }

  insertComponentsDeferred(entity: Entity, ...components: Component[]) {
    this.commands.enqueue((world) =>
      world.insertComponents(entity, ...components),
    );
  }

  despawnDeferred(entity: Entity) {
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
  private readonly descriptors = new Map<Entity, CachedQueryResult>();

  constructor(private readonly query: WorldQuery<F>) {}

  notify(generation: number, entity: Entity, archetype: Archetype) {
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
    readonly entity: Entity,
    public archetype: Archetype,
    public generation: number,
  ) {}
}
