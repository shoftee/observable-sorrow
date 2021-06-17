import { Ref } from "vue";

import { IGame, IRegisterInGame } from "../../game/game";
import { EnvironmentState } from "@/app/environment/state";
import { IMetadata } from "@/app/environment/metadata";
import Manager from "@/app/environment/manager";

class Interactor implements IRegisterInGame {
  private environment!: Manager;

  register(game: IGame): void {
    this.environment = game.managers.environment;
  }

  get state(): Ref<EnvironmentState> {
    return this.environment.getState();
  }

  get metadata(): IMetadata {
    return this.environment.getMeta();
  }
}

export default Interactor;
