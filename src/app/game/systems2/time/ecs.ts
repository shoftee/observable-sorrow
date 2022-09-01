import {
  WorldQueryFactory,
  WorldQueryFactoryTuple,
} from "@/app/ecs/query/types";
import { System, SystemFn } from "@/app/ecs/system";
import { World } from "@/app/ecs";

import { Timer } from "./types";
import { v4 as uuidv4 } from "uuid";

type TimerFactory = WorldQueryFactory<Iterable<[Readonly<Timer>]>>;

export function PerTickSystem<F extends WorldQueryFactoryTuple>(
  timer: TimerFactory,
  ...fs: F
) {
  return (runner: SystemFn<F>) => {
    return {
      id: uuidv4(),
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
}
