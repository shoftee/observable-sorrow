import { IResourceState as IState } from "@/app/entities/resource";
import Manager from "@/app/resources/manager";
import { IGame, IRegisterInGame } from "../../game/game";

import { readonly, Ref } from "vue";

class Interactor implements IRegisterInGame {
  private resources!: Manager;

  register(game: IGame): void {
    this.resources = game.managers.resources;
  }

  all(): Ref<IState>[] {
    return readonly(this.resources.allStates()) as Ref<IState>[];
  }
}

export default Interactor;
