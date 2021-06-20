import { EnvironmentPresenter, IEnvironmentPresenter } from "../environment";
import { IResourcePresenter, ResourcePresenter } from "../resources";
import { Game } from "./game";

export interface IGamePresenter {
  readonly environment: IEnvironmentPresenter;
  readonly resources: IResourcePresenter;

  start(): void;
  stop(): void;
  forceUpdate(): void;
  render(): void;
}

export class GamePresenter implements IGamePresenter {
  private readonly game: Game;

  readonly environment: EnvironmentPresenter = new EnvironmentPresenter();
  readonly resources: ResourcePresenter = new ResourcePresenter();

  constructor(game: Game) {
    this.game = game;
    this.environment.register(this.game);
    this.resources.register(this.game);
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

  render(): void {
    this.environment.render();
    this.resources.render();
  }
}
