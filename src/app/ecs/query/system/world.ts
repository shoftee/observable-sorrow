import { SystemTicks } from "@/app/ecs";

import { FetcherFactory } from "../types";

type World = {
  ticks: SystemTicks;
};

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
