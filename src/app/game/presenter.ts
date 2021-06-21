import { Resolver } from "../core";
import { IEntity, IInit } from "../ecs";
import { EnvironmentPresenter, IEnvironmentPresenter } from "../environment";
import { IResourcePresenter, ResourcePresenter } from "../resources";
import { IWorkshopPresenter, WorkshopPresenter } from "../workshop/presenter";
import { Game } from "./entity";

export interface IGamePresenter {
  readonly environment: IEnvironmentPresenter;
  readonly resources: IResourcePresenter;
  readonly workshop: IWorkshopPresenter;

  start(): void;
  stop(): void;
  forceUpdate(): void;
  render(): void;
}

export class GamePresenter implements IGamePresenter, IInit {
  private readonly game: Game;

  readonly environment: EnvironmentPresenter = new EnvironmentPresenter();
  readonly resources: ResourcePresenter = new ResourcePresenter();
  readonly workshop: WorkshopPresenter = new WorkshopPresenter();

  constructor(game: Game) {
    this.game = game;
  }

  init(resolver: Resolver<IEntity>): void {
    this.environment.init(resolver);
    this.resources.init(resolver);
    this.workshop.init(resolver);
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
