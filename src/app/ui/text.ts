import { IGame, IRegisterInGame } from "../systems/game";
import { SeasonKind } from "../_metadata/environment";
import { ResourceId } from "../_metadata/resources";

interface IResourceAccessor {
  title(id: ResourceId): string;
}

interface IEnvironmentAccessor {
  season(id: SeasonKind): string;
}

interface ITextManager {
  resources(): IResourceAccessor;
  environment(): IEnvironmentAccessor;
}

class TextManager implements ITextManager, IRegisterInGame {
  private resourcesAccessor!: IResourceAccessor;
  private environmentAccessor!: IEnvironmentAccessor;

  register(game: IGame): void {
    const metadata = game.metadata;
    this.resourcesAccessor = {
      title: (id) => metadata.resources[id].title,
    };
    this.environmentAccessor = {
      season: (id) => metadata.environment.seasons[id].title,
    };
  }

  resources(): IResourceAccessor {
    return this.resourcesAccessor;
  }
  environment(): IEnvironmentAccessor {
    return this.environmentAccessor;
  }
}

export { ITextManager, TextManager };
