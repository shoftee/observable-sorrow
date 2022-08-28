import { computed, reactive } from "vue";
import { IStateManager } from "../state-manager";

export function newAstronomyView(manager: IStateManager): AstronomyView {
  return reactive({
    hasRareEvent: computed(() => manager.state.astronomy.hasRareEvent),
  });
}

interface AstronomyView {
  hasRareEvent: boolean;
}
