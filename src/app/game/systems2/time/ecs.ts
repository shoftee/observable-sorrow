import { SystemParamDescriptor } from "@/app/ecs/query/types";
import { System, SystemFn, SystemSpecification } from "@/app/ecs/system";
import { inspectable, World } from "@/app/ecs";

import { Timer } from "./types";
import { v4 as uuidv4 } from "uuid";

type TimerFactory = SystemParamDescriptor<Iterable<[Readonly<Timer>]>>;

/** Calls the provided system code when a timer ticks. */
export function PerTickSystem(timer: TimerFactory) {
  return <F extends [...SystemParamDescriptor[]]>(...fs: F) => {
    return (runner: SystemFn<F>) => {
      return <SystemSpecification>{
        id: uuidv4(),
        inspect() {
          return inspectable(PerTickSystem, [timer, ...fs]);
        },
        build(world: World) {
          const innerFn = System(...fs)(runner).build(world);

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
