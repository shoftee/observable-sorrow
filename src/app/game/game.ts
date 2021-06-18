import LimitsManager from "../effects/limits/manager";
import { EnvironmentManager } from "../environment/manager";
import { ResourceManager } from "../resources/manager";
import TimeManager from "../time/manager";
import Updater from "./updater";

import { StateManager, IStateManager } from "../ui/states";
import { CommandManager, ICommandManager } from "../ui/commands";

interface IGame {
  readonly managers: IGameManagers;
}

interface IUiGame {
  readonly commands: ICommandManager;
  readonly states: IStateManager;

  start(): void;
}

interface IRegisterInGame {
  register(game: IGame): void;
}

interface IGameManagers {
  readonly time: TimeManager;
  readonly updater: Updater;
  readonly environment: EnvironmentManager;
  readonly resources: ResourceManager;
  readonly limits: LimitsManager;
}

class Game implements IGame {
  readonly managers: IGameManagers = {
    time: new TimeManager(),
    updater: new Updater(),
    environment: new EnvironmentManager(),
    resources: new ResourceManager(),
    limits: new LimitsManager(),
  };

  readonly commands: CommandManager = new CommandManager();
  readonly states: StateManager = new StateManager();

  constructor() {
    this.register(this.managers.updater);
    this.register(this.managers.environment);

    this.register(this.commands);
    this.register(this.states);
  }

  private register(target: IRegisterInGame) {
    target.register(this);
  }

  start(): void {
    this.managers.time.start();
  }
}

export { Game, IGame, IUiGame, IRegisterInGame };
