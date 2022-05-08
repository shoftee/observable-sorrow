import { Queue } from "queue-typescript";

import { Constructor as Ctor } from "@/app/utils/types";

import { EcsEvent } from "@/app/ecs";
import { FetcherFactory } from "../types";

class Dispatcher<E extends EcsEvent> {
  constructor(private readonly queue: Queue<E>) {}

  dispatch(event: E): void {
    this.queue.enqueue(event);
  }
}

export function Dispatch<E extends EcsEvent>(
  ctor: Ctor<E>,
): FetcherFactory<Dispatcher<E>> {
  return {
    create(state) {
      const dispatcher = new Dispatcher<E>(state.world.events(ctor));
      return {
        fetch(): Dispatcher<E> {
          return dispatcher;
        },
      };
    },
  };
}
