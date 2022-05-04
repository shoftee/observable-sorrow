import { Queue } from "queue-typescript";

import { Constructor as Ctor } from "@/app/utils/types";
import { Component, Entity, Event, Resource, WorldState } from "./world";
import { single } from "../utils/collections";
import { All, AllResults, AllParams, Filters } from "./query";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Fetcher<T = any> = {
  fetch(): T;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FetcherFactory<T = any> = {
  create(state: WorldState): Fetcher<T>;
};

export function Res<R extends Resource>(ctor: Ctor<R>): FetcherFactory<R> {
  return {
    create: (state) => {
      return {
        fetch: () => {
          const res = state.world.resource(ctor);
          if (res === undefined) {
            throw new Error("Resource not found.");
          }
          return res;
        },
      };
    },
  };
}

class Receiver<E extends Event> {
  constructor(private readonly queue: Queue<E>) {}

  *pull(): Iterable<E> {
    let event: E;
    while ((event = this.queue.dequeue())) {
      yield event;
    }
  }
}

export function Receive<E extends Event>(
  ctor: Ctor<E>,
): FetcherFactory<Receiver<E>> {
  return {
    create(state) {
      const receiver = new Receiver(state.world.events(ctor));
      return {
        fetch(): Receiver<E> {
          return receiver;
        },
      };
    },
  };
}

class Dispatcher<E extends Event> {
  constructor(private readonly queue: Queue<E>) {}

  dispatch(event: E): void {
    this.queue.enqueue(event);
  }
}

export function Dispatch<E extends Event>(
  ctor: Ctor<E>,
): FetcherFactory<Dispatcher<E>> {
  return {
    create(state: WorldState) {
      const dispatcher = new Dispatcher<E>(state.world.events(ctor));
      return {
        fetch(): Dispatcher<E> {
          return dispatcher;
        },
      };
    },
  };
}

type Commands = {
  spawn(...components: Component[]): Entity;
  insertComponents(entity: Entity, ...components: Component[]): void;
};
export function Commands(): FetcherFactory<Commands> {
  return {
    create(state) {
      const commands = {
        spawn(...components: Component[]) {
          const entity = state.spawn();
          state.insertComponentsDeferred(entity, ...components);
          return entity;
        },
        insertComponents(entity: Entity, ...components: Component[]) {
          state.insertComponentsDeferred(entity, ...components);
        },
      };
      return {
        fetch() {
          return commands;
        },
      };
    },
  };
}

type QueryFetcher<Q extends AllParams> = {
  all(): Iterable<AllResults<Q>>;
  single(): AllResults<Q>;
};

class QueryFactory<Q extends AllParams> {
  private query;

  constructor(...wq: Q) {
    this.query = All(...wq);
  }

  filter<F extends Filters>(...f: F): QueryFactory<Q> {
    this.query = this.query.filter(...f);
    return this;
  }

  create(state: WorldState): Fetcher<QueryFetcher<Q>> {
    const query = this.query;
    state.addQuery(query);

    const fetcher = {
      *all() {
        yield* state.fetchQuery(query);
      },
      single() {
        return single(state.fetchQuery(query));
      },
    };
    return {
      fetch() {
        return fetcher;
      },
    };
  }
}

export function Query<Q extends AllParams>(...wq: Q): QueryFactory<Q> {
  return new QueryFactory<Q>(...wq);
}

type FactoryTuple = [...FetcherFactory[]];

type ResultTuple<FactoryTuple> = FactoryTuple extends [
  infer Head,
  ...infer Tail,
]
  ? [...UnwrapResultFromFactory<Head>, ...ResultTuple<Tail>]
  : [];
type UnwrapResultFromFactory<Factory> = Factory extends FetcherFactory<infer T>
  ? [T]
  : [];

type RunnerFn<F extends FactoryTuple, Result> = (
  ...args: ResultTuple<F>
) => Result;

export type IntoSystem<R = void> = {
  intoSystem(state: WorldState): SystemRunner<R>;
};

export type SystemRunner<Result = void> = {
  run(): Result;
};

class SystemBuilder<F extends FactoryTuple, R> {
  constructor(
    private readonly factories: F,
    private readonly run: RunnerFn<F, R>,
  ) {}

  intoSystem(state: WorldState): SystemRunner<R> {
    const fetchers = this.factories.map((f) => f.create(state));
    return {
      run: () => {
        const args = fetchers.map((p) => p.fetch()) as ResultTuple<F>;
        return this.run(...args);
      },
    };
  }
}

export function System<F extends FactoryTuple>(...f: F) {
  return (runner: RunnerFn<F, void>) => {
    return new SystemBuilder(f, runner);
  };
}

export function RunCondition<F extends FactoryTuple>(...f: F) {
  return (runner: RunnerFn<F, boolean>) => {
    return new SystemBuilder(f, runner);
  };
}
