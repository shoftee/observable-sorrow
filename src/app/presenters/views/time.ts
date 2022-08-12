import { computed, reactive } from "vue";
import { IStateManager } from "../state-manager";

export function newTimeView(manager: IStateManager): TimeView {
  const state = manager.state.time;
  return reactive({
    power: computed(() => state.power),
    paused: computed(() => state.paused),
  });
}

interface TimeView {
  power: number;
  paused: boolean;
}
