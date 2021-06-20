import { MetadataPool } from "../_metadata/pool";
import { SystemTimestampProvider } from "../components/common";
import { EnvironmentEntity } from "../environment";
import { ResourcePoolEntity } from "../resources";
import { GamePresenter, GameUpdater } from ".";

interface IGame {
  readonly environment: EnvironmentEntity;
  readonly resources: ResourcePoolEntity;
  readonly metadata: MetadataPool;
}

export class Game implements IGame {
  readonly metadata: MetadataPool = new MetadataPool();
  readonly environment: EnvironmentEntity = new EnvironmentEntity();
  readonly resources: ResourcePoolEntity = new ResourcePoolEntity();

  presenter?: GamePresenter;

  init(): GamePresenter {
    this.environment.init();
    this.resources.init();

    this.presenter = new GamePresenter(this);
    return this.presenter;
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
    this.resources.update(deltaTime);

    this.presenter?.render();
  }

  forceUpdate(): void {
    this.updater?.force();
  }
}
