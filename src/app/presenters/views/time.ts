import { StateSchema } from "@/app/game/systems2/core";
import { computed, reactive } from "vue";

export function newTimeView(state: StateSchema): TimeView {
  const { time } = state;
  return reactive({
    power: computed(() => time.power),
    paused: computed(() => time.paused),
  });
}

interface TimeView {
  power: number;
  paused: boolean;
}
