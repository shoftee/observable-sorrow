import { unref } from "vue";
import { IRegisterInGame, IGame } from "../systems/game";
import { IResourceManager } from "../systems/resources";

interface ICommandManager {
  gatherCatnip(): void;
}

class CommandManager implements ICommandManager, IRegisterInGame {
  resources!: IResourceManager;

  register(game: IGame): void {
    this.resources = game.resources;
  }

  gatherCatnip(): void {
    const catnip = unref(this.resources.getState("catnip"));
    const capacity = catnip.capacity ?? Number.POSITIVE_INFINITY;
    catnip.amount = Math.min(catnip.amount + 1, capacity);
  }
}

export { ICommandManager, CommandManager };
