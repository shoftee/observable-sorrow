import { Queue } from "queue-typescript";

import { Constructor } from "@/app/utils/types";
import { containsAll } from "@/app/utils/collections";

import {
  Component,
  ComponentCtor,
  Entity,
  World,
  IQuery,
  Archetype,
  Event,
  Resource,
} from "./world";
import { Fetch, FetchContext } from "./fetch";
import { Enumerable } from "../utils/enumerable";

type Descriptor<C extends Component = Component> = {
  ctors: Constructor<C>[];
};

export function Ref<C extends Component>(
  ctor: ComponentCtor<C>,
): Descriptor<C> {
  return { ctors: [ctor] };
}

const MutableType = Symbol("Mutable");
type MutableDescriptor<C extends Component = Component> = Descriptor<C> & {
  [MutableType]: true;
};
export function Mut<C extends Component>(
  ctor: ComponentCtor<C>,
): MutableDescriptor<C> {
  return { ctors: [ctor], [MutableType]: true };
}

const WithFilterType = Symbol("WithFilter");
type WithDescriptor = Descriptor & {
  [WithFilterType]: true;
};
function isWithFilter(descriptor: Descriptor): descriptor is WithDescriptor {
  return (descriptor as WithDescriptor)[WithFilterType] === true;
}
export function With(...ctors: ComponentCtor[]): WithDescriptor {
  return { ctors, [WithFilterType]: true };
}
export type QueryParams = [...Descriptor[]];
export type QueryArgs<T> = T extends [infer Head, ...infer Tail]
  ? UnwrapQueryArg<Head> extends never
    ? [...QueryArgs<Tail>]
    : [UnwrapQueryArg<Head>, ...QueryArgs<Tail>]
  : [];

type UnwrapQueryArg<T> = T extends MutableDescriptor<infer C>
  ? C
  : T extends WithDescriptor
  ? never // exclude with filters from argument list
  : T extends Descriptor<infer C>
  ? Readonly<C> // non-mut arguments appear as Readonly<T>
  : never;

export class FetchEntity implements Fetch<Entity> {
  fetch(ctx: FetchContext): Entity {
    return ctx.entity;
  }
}

export class ComponentQuery<P extends QueryParams>
  implements IQuery, Fetch<QueryArgs<P>>
{
  readonly results = new Set<Entity>();
  readonly descriptors: Descriptor[];
  readonly includes: ComponentCtor[] = [];

  constructor(...params: P) {
    this.descriptors = params;
    this.includes = new Enumerable(params).flatMap((d) => d.ctors).toArray();
  }

  notify(entity: Entity, archetype: Archetype): void {
    if (archetype.size === 0) {
      // ComponentQuery requires at least one parameter.
      // Thus, an entity without data will never match any query.
      this.results.delete(entity);
    } else {
      // If the query requires components S and the entity has components R,
      // Whether the query should return the entity is determined by checking if R contains S.
      if (containsAll(archetype, this.includes)) {
        this.results.add(entity);
      } else {
        this.results.delete(entity);
      }
    }
  }

  fetch(ctx: FetchContext): QueryArgs<P> {
    const archetype = ctx.archetypes.archetype(ctx.entity);

    const args = new Array(this.descriptors.length);
    let i = 0;
    for (const descriptor of this.descriptors) {
      if (isWithFilter(descriptor)) {
        continue;
      }
      const ctor = descriptor.ctors[0];
      const arg = archetype.get(ctor);
      if (arg === undefined) {
        throw new Error(`Archetype does not contain data for ${ctor}.`);
      }
      args[i++] = arg;
    }
    return args as unknown as QueryArgs<P>;
  }

  *all(world: World): Iterable<QueryArgs<P>> {
    for (const result of this.results) {
      yield this.fetch({ archetypes: world, entity: result });
    }
  }

  single(world: World): QueryArgs<P> {
    let result: QueryArgs<P> | undefined;
    for (const item of this.all(world)) {
      if (result !== undefined) {
        throw new Error("Query has more than one result");
      }
      result = item;
    }
    if (result === undefined) {
      throw new Error("Query has no results");
    }
    return result;
  }
}

type WorldCommand = (world: World) => void;

export class WorldState {
  private readonly queries = new Set<IQuery>();

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
    const row = this.world.archetype(entity);
    for (const query of this.queries) {
      query.notify(entity, row);
    }
  }

  addQuery(query: IQuery) {
    this.queries.add(query);
    for (const [entity, row] of this.world.archetypes()) {
      query.notify(entity, row);
    }
  }

  removeQuery(query: IQuery) {
    this.queries.delete(query);
    for (const [entity] of this.world.archetypes()) {
      query.notify(entity, new Map());
    }
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
