import { IRegisterInGame, IGame } from "../systems/game";
import {
  IEnvironmentAccessor,
  IResourceAccessor,
  IStateManager,
} from "./interfaces";

class StateManager implements IStateManager, IRegisterInGame {
  private resourceAccessor!: IResourceAccessor;
  private environmentAccessor!: IEnvironmentAccessor;

  register(game: IGame): void {
    this.resourceAccessor = {
      all: () => game.resources.allStates(),
      get: (id) => game.resources.getState(id),
    };
    this.environmentAccessor = {
      get: () => game.environment.getState(),
      meta: () => game.metadata.environment,
    };
  }

  resources(): IResourceAccessor {
    return this.resourceAccessor;
  }

  environment(): IEnvironmentAccessor {
    return this.environmentAccessor;
  }
}

export { StateManager };
