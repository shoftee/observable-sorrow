import { computed, reactive } from "vue";

import { StateSchema } from "@/app/game/systems2/core";

export function newAstronomyView(schema: StateSchema): AstronomyView {
  return reactive({
    hasRareEvent: computed(() => schema.astronomy.hasRareEvent),
  });
}

interface AstronomyView {
  hasRareEvent: boolean;
}
