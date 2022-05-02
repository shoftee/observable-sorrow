import { Constructor, getConstructorOf } from "@/app/utils/types";
import { getOrAdd, TypeSet } from "@/app/utils/collections";
import { Queue } from "queue-typescript";

export const Type = Symbol("Type");

export const EntityType = Symbol("EntityType");
export class Entity {
  static readonly [Type] = EntityType;
  [EntityType]: true;
}

export const ComponentType = Symbol("Component");
export abstract class Component {
  static readonly [Type] = ComponentType;
  protected [ComponentType]: true;
}

export const ResourceType = Symbol("Resource");
export abstract class Resource {
  static readonly [Type] = ResourceType;
  protected [ResourceType]: true;
}

export const EventType = Symbol("Event");
export abstract class Event {
  static readonly [Type] = EventType;
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

  spawn(...components: Component[]): Entity {
    const entity = Object.freeze(new Entity());
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

class Table<Row, Column, Cell> {
  static readonly EMPTY_ROW = new Map();

  private readonly table = new Map<Row, Map<Column, Cell>>();

  cell(row: Row, column: Column): Cell | undefined {
    const cellColumns = this.table.get(row);
    return cellColumns?.get(column);
  }

  row(row: Row): ReadonlyMap<Column, Cell> {
    const cellColumns = this.table.get(row);
    return cellColumns || Table.EMPTY_ROW;
  }

  add(row: Row, column: Column, setter: (exists: boolean) => Cell | undefined) {
    const cellColumns = getOrAdd(this.table, row, () => new Map());
    const newValue = setter(cellColumns.has(column));
    cellColumns.set(column, newValue);
  }

  removeCell(row: Row, column: Column): boolean {
    const cellColumns = this.table.get(row);
    if (cellColumns && cellColumns.delete(column) && cellColumns.size === 0) {
      this.table.delete(row);
      return true;
    }
    return false;
  }

  removeRow(row: Row): boolean {
    return this.table.delete(row);
  }

  *rows(): Iterable<[Row, ReadonlyMap<Column, Cell>]> {
    yield* this.table;
  }
}
