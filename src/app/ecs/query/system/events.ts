import { consume, getOrAdd } from "@/app/utils/collections";
import { Constructor as Ctor } from "@/app/utils/types";

import { EcsEvent, inspectable, inspectableNames } from "@/app/ecs";

import { SystemParamDescriptor } from "../types";

type Receive<E extends EcsEvent> = SystemParamDescriptor<{
  pull(): Iterable<E>;
}>;
type Dispatch<E extends EcsEvent> = SystemParamDescriptor<{
  dispatch(event: E): void;
}>;

const Receivers = new WeakMap<Ctor<EcsEvent>, Receive<EcsEvent>>();
const Dispatchers = new WeakMap<Ctor<EcsEvent>, Dispatch<EcsEvent>>();

/** Used to receive events of type `E` using a synchronous pull mechanism. */
export function Receive<E extends EcsEvent>(ctor: Ctor<E>): Receive<E> {
  const cache = Receivers as WeakMap<Ctor<E>, Receive<E>>;
  return getOrAdd(cache, ctor, newReceive);
}
function newReceive<E extends EcsEvent>(ctor: Ctor<E>): Receive<E> {
  return {
    inspect() {
      return inspectable(Receive, inspectableNames([ctor]));
    },
    create({ events }) {
      const queue = events.get(ctor);
      return {
        fetch() {
          return {
            *pull(): Iterable<E> {
              yield* consume(queue);
            },
          };
        },
      };
    },
  };
}

/** Used to dispatch events of type `E`. */
export function Dispatch<E extends EcsEvent>(ctor: Ctor<E>): Dispatch<E> {
  const cache = Dispatchers as WeakMap<Ctor<E>, Dispatch<E>>;
  return getOrAdd(cache, ctor, newDispatch);
}
function newDispatch<E extends EcsEvent>(ctor: Ctor<E>): Dispatch<E> {
  return {
    inspect() {
      return inspectable(Dispatch, inspectableNames([ctor]));
    },
    create({ events }) {
      const queue = events.get(ctor);
      return {
        fetch() {
          return {
            dispatch(event: E): void {
              queue.enqueue(event);
            },
          };
        },
      };
    },
  };
}
