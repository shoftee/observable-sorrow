import { unref } from "vue";
import { IGame, IRegisterInGame } from "../game/game";
import { ResourceManager } from "../resources/manager";
import { RecipeId } from "../_metadata/recipes";

interface ICommandManager {
  gatherCatnip(): void;
  buildRecipe(id: RecipeId): void;
}

class CommandManager implements ICommandManager, IRegisterInGame {
  resources!: ResourceManager;

  register(game: IGame): void {
    this.resources = game.managers.resources;
  }

  gatherCatnip(): void {
    unref(this.resources.getState("catnip")).amount++;
  }

  buildRecipe(_id: RecipeId): void {
    //
  }
}

export { ICommandManager, CommandManager };
