import { SystemTimestampProvider } from "../core/timestamp-provider";

import { Environment, IEnvironmentPresenter } from "../environment";
import { ResourcePool, ResourcePresenter } from "../resources";
import { Workshop } from "../workshop/entity";
import { GameUpdater, IGameRunner } from ".";
import { WorkshopPresenter } from "../workshop";

export interface IGame {
  readonly runner: IGameRunner;
}

export class Game implements IGame {
  private readonly _updater: GameUpdater;
  private readonly _runner: IGameRunner;

  constructor(
    private readonly _resources: ResourcePool,
    private readonly _environment: Environment,
    private readonly _workshop: Workshop,
    private readonly _environmentPresenter: IEnvironmentPresenter,
    private readonly _resourcesPresenter: ResourcePresenter,
    private readonly _workshopPresenter: WorkshopPresenter,
  ) {
    this._updater = new GameUpdater(
      (dt) => this.update(dt),
      new SystemTimestampProvider(),
    );

    this._runner = {
      start: () => this._updater.start(),
      stop: () => this._updater.stop(),
      forceUpdate: () => this._updater.force(),
    };
  }

  get runner(): IGameRunner {
    return this._runner;
  }

  private update(deltaTime: number): void {
    this._workshop.update(deltaTime);

    this._environment.update(deltaTime);
    this._resources.update(deltaTime);

    this._environmentPresenter.render();
    this._resourcesPresenter.render();
    this._workshopPresenter.render();
  }
}
