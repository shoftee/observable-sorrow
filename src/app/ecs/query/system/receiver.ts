import { Queue } from "queue-typescript";

import { Constructor as Ctor } from "@/app/utils/types";

import { EcsEvent } from "@/app/ecs";
import { FetcherFactory } from "../types";

class Receiver<E extends EcsEvent> {
  constructor(private readonly queue: Queue<E>) {}

  *pull(): Iterable<E> {
    let event: E;
    while ((event = this.queue.dequeue())) {
      yield event;
    }
  }
}

export function Receive<E extends EcsEvent>(
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
