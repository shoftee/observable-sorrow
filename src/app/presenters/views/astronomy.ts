import { computed, reactive } from "vue";
import { IStateManager } from "../state-manager";

export function newAstronomyView(manager: IStateManager): AstronomyView {
  return reactive({
    showObserveSky: computed(
      () => (manager.state.countdowns?.rareEvent?.remaining ?? 0) > 0,
    ),
  });
}

interface AstronomyView {
  showObserveSky: boolean;
}
