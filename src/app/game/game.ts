import { MetadataPool } from "../_metadata/pool";
import { ResourceManager } from "../entities/resources";
import { EnvironmentEntity } from "../environment";

import { StateManager } from "../ui/states";
import { CommandManager } from "../ui/commands";
import { TextManager } from "../ui/text";
import { IGame, IRegisterInGame } from "../systems/game";
import { GameUpdater } from "./updater";
import { SystemTimestampProvider } from "../components/common";
import { IUiGame } from "../ui/game";
import { EnvironmentPresenter } from "../ui/environment";

class Game implements IGame {
  readonly metadata: MetadataPool = new MetadataPool();
  readonly environment: EnvironmentEntity = new EnvironmentEntity();
  readonly resources: ResourceManager = new ResourceManager();

  constructor() {
    this.register(this.resources);
  }

  register(target: IRegisterInGame): void {
    target.register(this);
  }

  init(): IUiGame {
    this.environment.init();

    return new UiGame(this);
  }

  private updater?: GameUpdater;

  start(): void {
    this.updater = new GameUpdater(
      (deltaTime) => this.update(deltaTime),
      new SystemTimestampProvider(),
    );
    this.updater.start();
  }

  stop(): void {
    this.updater?.stop();
  }

  private update(deltaTime: number): void {
    this.environment.update(deltaTime);
  }

  forceUpdate(): void {
    this.updater?.force();
  }
}

class UiGame implements IUiGame {
  readonly game: Game;

  readonly environment: EnvironmentPresenter = new EnvironmentPresenter();
  readonly commands: CommandManager = new CommandManager();
  readonly states: StateManager = new StateManager();
  readonly text: TextManager = new TextManager();

  constructor(game: Game) {
    this.game = game;

    this.register(this.environment);
    this.register(this.commands);
    this.register(this.states);
    this.register(this.text);
  }

  private register(manager: IRegisterInGame) {
    this.game.register(manager);
  }

  start(): void {
    this.game.start();
  }

  stop(): void {
    this.game.stop();
  }

  forceUpdate(): void {
    this.game.forceUpdate();
  }
}

export { Game, UiGame };
