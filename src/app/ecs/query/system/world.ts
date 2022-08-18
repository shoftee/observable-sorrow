import { SystemTicks } from "@/app/ecs";

import { FetcherFactory } from "../types";

type World = {
  ticks: SystemTicks;
};

/** Used for magical queries that need direct access to world state.
 *
 * Currently only used for getting change detection to work.
 */
export function World(): FetcherFactory<World> {
  return {
    create(state) {
      return {
        fetch() {
          return { ticks: state.world.ticks };
        },
      };
    },
  };
}
