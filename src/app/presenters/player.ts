import { reactive } from "vue";

import { IStateManager } from ".";

export interface PlayerItem {
  gatherCatnip: number;
  timeAcceleration: number;
}

export class PlayerPresenter {
  readonly state: PlayerItem;
  constructor(manager: IStateManager) {
    this.state = reactive({
      gatherCatnip: manager.player().gatherCatnip,
      timeAcceleration: manager.player().timeAcceleration,
    });
  }
}
