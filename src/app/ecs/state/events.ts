import { Queue } from "queue-typescript";

import { Constructor as Ctor } from "@/app/utils/types";

import { EcsEvent } from "../types";

export class EventState {
  private readonly queues = new Map<Ctor<EcsEvent>, Queue<EcsEvent>>();

  register<E extends EcsEvent>(ctor: Ctor<E>) {
    const events = this.queues;
    if (events.has(ctor)) {
      throw new Error(`Event ${ctor.name} already registered.`);
    }
    events.set(ctor, new Queue<E>());
  }

  get<E extends EcsEvent>(ctor: Ctor<E>): Queue<E> {
    const queue = this.queues.get(ctor);
    if (queue === undefined) {
      throw new Error(`Event ${ctor.name} not registered.`);
    }
    return queue as Queue<E>;
  }
}
