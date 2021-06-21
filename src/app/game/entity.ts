import { SystemTimestampProvider } from "../core/timestamp-provider";
import { EnvironmentEntity } from "../environment";
import { ResourcePoolEntity } from "../resources";
import { GamePresenter, GameUpdater, EntityResolver } from ".";
import { WorkshopEntity } from "../workshop/entity";

export interface IGame {
  readonly environment: EnvironmentEntity;
  readonly resources: ResourcePoolEntity;
}

export class Game implements IGame {
  private entities = {
    "resource-pool": new ResourcePoolEntity(),
    environment: new EnvironmentEntity(),
    workshop: new WorkshopEntity(),
  };

  private readonly resolver: EntityResolver;
  constructor() {
    this.resolver = new EntityResolver(this.entities);
  }

  presenter?: GamePresenter;

  init(): GamePresenter {
    for (const entity of Object.values(this.entities)) {
      entity.init(this.resolver);
    }

    this.presenter = new GamePresenter(this);
    this.presenter.init(this.resolver);
    return this.presenter;
  }

  get resources(): ResourcePoolEntity {
    return this.entities["resource-pool"];
  }

  get environment(): EnvironmentEntity {
    return this.entities["environment"];
  }

  get workshop(): WorkshopEntity {
    return this.entities["workshop"];
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
    this.workshop.update(deltaTime);

    this.environment.update(deltaTime);
    this.resources.update(deltaTime);

    this.presenter?.render();
  }

  forceUpdate(): void {
    this.updater?.force();
  }
}
