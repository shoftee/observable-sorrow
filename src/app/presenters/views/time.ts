import { computed, reactive } from "vue";
import { IStateManager } from "../state-manager";

export function newTimeView(manager: IStateManager): TimeView {
  return reactive({
    power: computed(() => manager.state.time.power),
    paused: computed(() => manager.state.time.paused),
  });
}

interface TimeView {
  power: number;
  paused: boolean;
}
