import { v4 as uuidv4 } from "uuid";

import { take } from "@/app/utils/collections";
import { Constructor as Ctor } from "@/app/utils/types";

import { EcsEvent, inspectable, inspectableNames } from "@/app/ecs";
import { Receive } from "@/app/ecs/query";
import { SystemParamDescriptor } from "@/app/ecs/query/types";
import {
  System,
  SystemParamTuple,
  SystemSpecification,
} from "@/app/ecs/system";

type ReceiverSystemFn<
  E extends EcsEvent,
  F extends [...SystemParamDescriptor[]],
> = (event: E, ...args: SystemParamTuple<F>) => void;

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
  return <F extends [...SystemParamDescriptor[]]>(...fs: F) => {
    return (runner: ReceiverSystemFn<E, F>) => {
      return <SystemSpecification>{
        id: uuidv4(),
        inspect() {
          return inspectable(ReceiverSystem, [eventInspectable, ...fs]);
        },
        build(world) {
          let currentEvent: E;
          const innerFn = System(...fs)((...args) => {
            runner(currentEvent, ...args);
          }).build(world);

          const receiverSystem = System(Receive(eventCtor))((events) => {
            const relevantEvents = throttle
              ? take(events.pull(), 1)
              : events.pull();
            for (const event of relevantEvents) {
              currentEvent = event;
              innerFn();
            }
          });

          return receiverSystem.build(world);
        },
      };
    };
  };
}
