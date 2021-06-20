import { IGame, IRegisterInGame } from "../systems/game";
import { SeasonId } from "../environment/metadata";
import { RecipeId } from "../_metadata/recipes";
import { ResourceId } from "../resources/metadata";

interface IResourceAccessor {
  title(id: ResourceId): {
    title: string;
  };
}

interface IEnvironmentAccessor {
  season(id: SeasonId): {
    title: string;
  };
}

interface IRecipeAccessor {
  meta(id: RecipeId): {
    title: string;
    desc: string;
  };
}

interface ITextManager {
  resources(): IResourceAccessor;
  environment(): IEnvironmentAccessor;
  recipes(): IRecipeAccessor;
}

class TextManager implements ITextManager, IRegisterInGame {
  private resourcesAccessor!: IResourceAccessor;
  private environmentAccessor!: IEnvironmentAccessor;
  private recipeAccessor!: IRecipeAccessor;

  register(game: IGame): void {
    const metadata = game.metadata;
    this.resourcesAccessor = {
      title: (id) => metadata.resources[id],
    };
    this.environmentAccessor = {
      season: (id) => metadata.environment.seasons[id],
    };
    this.recipeAccessor = {
      meta: (id) => metadata.recipes[id],
    };
  }

  resources(): IResourceAccessor {
    return this.resourcesAccessor;
  }

  environment(): IEnvironmentAccessor {
    return this.environmentAccessor;
  }

  recipes(): IRecipeAccessor {
    return this.recipeAccessor;
  }
}

export { ITextManager, TextManager };
