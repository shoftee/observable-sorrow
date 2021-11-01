import { computed, reactive } from "vue";

import { IStateManager } from ".";

export interface PlayerItem {
  gatherCatnip: number;
  timeAcceleration: number;
}

export class PlayerPresenter {
  readonly state: PlayerItem;

  constructor(manager: IStateManager) {
    this.state = reactive({
      gatherCatnip: computed(() => manager.player().gatherCatnip),
      timeAcceleration: computed(() => manager.player().timeAcceleration),
    });
  }
}
