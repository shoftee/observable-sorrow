import { Queue } from "queue-typescript";

import { Constructor as Ctor } from "@/app/utils/types";

import { EcsEvent } from "@/app/ecs";
import { FetcherFactory } from "../types";
import { consume } from "@/app/utils/collections";

class Receiver<E extends EcsEvent> {
  constructor(private readonly queue: Queue<E>) {}

  *pull(): Iterable<E> {
    yield* consume(this.queue);
  }
}

/** Used to receive events of type E using a synchronous pull mechanism. */
export function Receive<E extends EcsEvent>(
  ctor: Ctor<E>,
): FetcherFactory<Receiver<E>> {
  return {
    create({ events }) {
      const receiver = new Receiver(events.get(ctor));
      return {
        fetch() {
          return receiver;
        },
      };
    },
  };
}
