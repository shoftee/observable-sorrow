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

/** Used to dispatch events of type E. */
export function Dispatch<E extends EcsEvent>(
  ctor: Ctor<E>,
): FetcherFactory<Dispatcher<E>> {
  return {
    create({ events }) {
      const dispatcher = new Dispatcher<E>(events.get(ctor));
      return {
        fetch(): Dispatcher<E> {
          return dispatcher;
        },
      };
    },
  };
}
