import { Ref } from "vue";
import { EnvironmentState } from "../entities/environment";
import { IResourceState } from "../entities/resource";
import { ResourceId } from "../_metadata/resources";
import { IEnvironmentMetadata } from "../_metadata/environment";

import { IGame, IRegisterInGame } from "../game/game";

interface IResourceAccessor {
  all(): Ref<IResourceState>[];
  get(id: ResourceId): Ref<IResourceState>;
}

interface IEnvironmentAccessor {
  get(): Ref<EnvironmentState>;
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
    const resources = game.managers.resources;
    this.resourceAccessor = {
      all: () => resources.allStates(),
      get: (id: ResourceId) => resources.getState(id),
    };
    const environment = game.managers.environment;
    this.environmentAccessor = {
      get: () => environment.getState(),
      meta: () => environment.getMeta(),
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
