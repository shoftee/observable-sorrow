import { ResourceState as State } from "@/app/resources/state";
import Manager from "@/app/resources/manager";
import { IGame, IRegisterInGame } from "../../game/game";

import { readonly, Ref } from "vue";

class Interactor implements IRegisterInGame {
  private resources!: Manager;

  register(game: IGame): void {
    this.resources = game.managers.resources;
  }

  all(): Ref<State>[] {
    return readonly(this.resources.allStates()) as Ref<State>[];
  }
}

export default Interactor;
