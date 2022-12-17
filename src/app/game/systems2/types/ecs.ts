import { v4 as uuidv4 } from "uuid";

import { take } from "@/app/utils/collections";
import { Constructor as Ctor } from "@/app/utils/types";

import { EcsEvent, inspectable, inspectableNames } from "@/app/ecs";
import { Receive } from "@/app/ecs/query";
import { SystemParamDescriptor } from "@/app/ecs/query/types";
import {
  System,
  UnwrapSystemParamTuple,
  SystemSpecification,
} from "@/app/ecs/system";

type ReceiverSystemFn<E extends EcsEvent, D extends SystemParamDescriptor[]> = (
  event: E,
  ...args: UnwrapSystemParamTuple<D>
) => void;

/** Calls the runner as if the events appeared one at a time. */
export function ThrottledReceiverSystem<E extends EcsEvent>(ctor: Ctor<E>) {
  return ReceiverSystem(ctor, true);
}

/** Calls the runner with all the events in order. */
export function BufferedReceiverSystem<E extends EcsEvent>(ctor: Ctor<E>) {
  return ReceiverSystem(ctor, false);
}

function ReceiverSystem<E extends EcsEvent>(
  eventCtor: Ctor<E>,
  throttle: boolean,
) {
  const eventInspectable = {
    inspect() {
      return inspectable(Receive, inspectableNames([eventCtor]));
    },
  };
  return <D extends SystemParamDescriptor[]>(...ds: D) => {
    return (runner: ReceiverSystemFn<E, D>): SystemSpecification => {
      return {
        id: uuidv4(),
        inspect() {
          return inspectable(ReceiverSystem, [eventInspectable, ...ds]);
        },
        build(world) {
          let currentEvent: E;
          const innerFn = System(...ds)((...args) => {
            runner(currentEvent, ...args);
          }).build(world);

          const receiverSpec = System(Receive(eventCtor))((events) => {
            const relevantEvents = throttle
              ? take(events.pull(), 1)
              : events.pull();
            for (const event of relevantEvents) {
              currentEvent = event;
              innerFn();
            }
          });

          return receiverSpec.build(world);
        },
      };
    };
  };
}
