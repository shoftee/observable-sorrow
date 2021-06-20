import { Ref } from "vue";
import { IResourceState } from "../components/resource";
import { IGame, IRegisterInGame } from "../systems/game";
import { ResourceId } from "../resources/metadata";

interface IResourceAccessor {
  all(): Ref<IResourceState>[];
  get(id: ResourceId): Ref<IResourceState>;
}

interface IStateManager {
  resources(): IResourceAccessor;
}

class StateManager implements IStateManager, IRegisterInGame {
  private resourceAccessor!: IResourceAccessor;

  register(game: IGame): void {
    this.resourceAccessor = {
      all: () => game.resources.allStates(),
      get: (id) => game.resources.getState(id),
    };
  }

  resources(): IResourceAccessor {
    return this.resourceAccessor;
  }
}

export { IStateManager, StateManager };
