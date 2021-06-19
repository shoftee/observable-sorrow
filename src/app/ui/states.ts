import { Ref } from "vue";
import { IEnvironmentState } from "../entities/environment";
import { IResourceState } from "../entities/resource";
import { IRegisterInGame, IGame } from "../systems/game";
import { IEnvironmentMetadata } from "../_metadata/environment";
import { ResourceId } from "../_metadata/resources";

interface IResourceAccessor {
  all(): Ref<IResourceState>[];
  get(id: ResourceId): Ref<IResourceState>;
}

interface IEnvironmentAccessor {
  get(): Ref<IEnvironmentState>;
  meta(): IEnvironmentMetadata;
}

interface IStateManager {
  resources(): IResourceAccessor;
  environment(): IEnvironmentAccessor;
}

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

export { IStateManager, StateManager };
