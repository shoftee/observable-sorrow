import { v4 as uuidv4 } from "uuid";

import { SystemParamDescriptor } from "@/app/ecs/query/types";
import { System, SystemFn, SystemSpecification } from "@/app/ecs/system";
import { inspectable, World } from "@/app/ecs";

import { Timer } from "./types";

type TimerFactory = SystemParamDescriptor<Iterable<[Readonly<Timer>]>>;

/** Calls the provided system code when a timer ticks. */
export function PerTickSystem(timer: TimerFactory) {
  return <D extends SystemParamDescriptor[]>(...ds: D) => {
    return (runner: SystemFn<D>): SystemSpecification => {
      return {
        id: uuidv4(),
        inspect() {
          return inspectable(PerTickSystem, [timer, ...ds]);
        },
        build(world: World) {
          const innerFn = System(...ds)(runner).build(world);

          const timerSystem = System(timer)((timers) => {
            for (const [timer] of timers) {
              let remaining = timer.elapsed;
              while (remaining-- > 0) {
                innerFn();
              }
            }
          });

          return timerSystem.build(world);
        },
      };
    };
  };
}
