import { Constructor } from "@/app/utils/types";
import { Queue } from "queue-typescript";
import { QueryParams, ComponentQuery, WorldState, QueryArgs } from "./query";
import { Component, Entity, Event, Resource } from "./world";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
abstract class SystemParam<T = any> {
  constructor(readonly state: WorldState) {}
  abstract get(): T;
}

interface Query<Q extends QueryParams> {
  all(): Iterable<QueryArgs<Q>>;
  single(): QueryArgs<Q>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SystemParamCtor<T = any> = Constructor<SystemParam<T>>;

type QueryCtor<Q extends QueryParams> = SystemParamCtor<Query<Q>>;
export function Query<Q extends QueryParams>(...params: Q): QueryCtor<Q> {
  return class extends SystemParam<Query<Q>> {
    private readonly query: ComponentQuery<Q>;
    constructor(state: WorldState) {
      super(state);

      state.addQuery((this.query = new ComponentQuery(...params)));
    }

    get(): Query<Q> {
      return {
        all: () => this.query.all(this.state.world),
        single: () => this.query.single(this.state.world),
      };
    }
  };
}

type ResCtor<R extends Resource> = SystemParamCtor<R>;
export function Res<R extends Resource>(ctor: Constructor<R>): ResCtor<R> {
  return class extends SystemParam<R> {
    get(): R {
      const res = this.state.world.resource(ctor);
      if (res === undefined) {
        throw new Error("Resource not found.");
      }
      return res;
    }
  };
}

class EventReader<E extends Event> {
  constructor(private readonly queue: Queue<E>) {}
  *receive(): Iterable<E> {
    let event: E;
    while ((event = this.queue.dequeue())) {
      yield event;
    }
  }
}
type EventReaderCtor<E extends Event> = SystemParamCtor<EventReader<E>>;
export function Reader<E extends Event>(
  ctor: Constructor<E>,
): EventReaderCtor<E> {
  return class extends SystemParam<EventReader<E>> {
    private readonly events: EventReader<E>;
    constructor(state: WorldState) {
      super(state);
      this.events = new EventReader<E>(this.state.world.events(ctor));
    }
    get(): EventReader<E> {
      return this.events;
    }
  };
}

type EventWriterCtor<E extends Event> = SystemParamCtor<EventWriter<E>>;
class EventWriter<E extends Event> {
  constructor(private readonly queue: Queue<E>) {}
  dispatch(event: E): void {
    this.queue.enqueue(event);
  }
}
export function Writer<E extends Event>(
  ctor: Constructor<E>,
): EventWriterCtor<E> {
  return class extends SystemParam<EventWriter<E>> {
    private readonly events: EventWriter<E>;
    constructor(state: WorldState) {
      super(state);
      this.events = new EventWriter<E>(this.state.world.events(ctor));
    }
    get(): EventWriter<E> {
      return this.events;
    }
  };
}

type Commands = {
  spawn(...components: Component[]): Entity;
  insertComponents(entity: Entity, ...components: Component[]): void;
};
export function Commands(): SystemParamCtor<Commands> {
  return class extends SystemParam<Commands> {
    private readonly commands: Commands;
    constructor(state: WorldState) {
      super(state);
      this.commands = {
        spawn: (...components) => {
          const entity = state.spawn();
          state.insertComponentsDeferred(entity, ...components);
          return entity;
        },
        insertComponents: (entity, ...components) => {
          state.insertComponentsDeferred(entity, ...components);
        },
      };
    }

    get() {
      return this.commands;
    }
  };
}

type SystemParams = [...SystemParamCtor[]];
type SystemArgs<S> = S extends [infer Head, ...infer Tail]
  ? [UnwrapArg<Head>, ...SystemArgs<Tail>]
  : [];
type UnwrapArg<T> = T extends SystemParamCtor<infer P> ? P : never;

export interface ISystem {
  update(): void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SystemCtor = new (state: WorldState, ...args: any) => ISystem;

abstract class SystemImpl<S extends SystemParams = SystemParams> {
  readonly params: S;
  constructor(readonly state: WorldState, ...params: S) {
    this.params = params;
  }

  update(): void {
    const args = new Array(this.params.length);
    for (let i = 0; i < this.params.length; i++) {
      const param = this.params[i];
      args[i] = new param(this.state).get();
    }
    this.run(args as SystemArgs<S>);
  }

  abstract run(args: SystemArgs<S>): void;
}

type RunnerFn<S extends SystemParams> = (...args: SystemArgs<S>) => void;

export function System<S extends SystemParams = SystemParams>(
  ...params: S
): (runner: RunnerFn<S>) => SystemCtor {
  return (runner: RunnerFn<S>) => {
    return class extends SystemImpl<S> {
      constructor(state: WorldState) {
        super(state, ...params);
      }
      run(args: SystemArgs<S>): void {
        runner(...args);
      }
    };
  };
}
