import { StateSchema } from "@/app/game/systems2/core";
import { computed, reactive } from "vue";

export function newTimeView(schema: StateSchema): TimeView {
  const { time: state } = schema;
  return reactive({
    power: computed(() => state.power),
    paused: computed(() => state.paused),
  });
}

interface TimeView {
  power: number;
  paused: boolean;
}
