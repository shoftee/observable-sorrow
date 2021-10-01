import { IBonfireInteractor, IGameController } from "@/_interfaces";
import { BuildingMetadata, ResourceMetadata } from "@/_state";
import {
  IPresenterSystem,
  GameUpdater,
  PresenterSystem,
  GameInteractor,
} from ".";
import { BonfireInteractor } from "../bonfire";
import { BuildingEntity } from "../buildings";
import { SystemTimestampProvider } from "../core";
import { Entity } from "../ecs";
import { EffectPoolEntity } from "../effects";
import { EnvironmentEntity } from "../environment";
import {
  BonfirePresenter,
  EnvironmentPresenter,
  ResourcePresenter,
} from "../presenters";
import { RootPresenter } from "../presenters/root";
import { ResourceEntity } from "../resources";
import {
  BuildingSystem,
  BuildingEffectsSystem,
  CraftingSystem,
  GameSystems,
  EnvironmentSystem,
  EffectsSystem,
  LockToggleSystem,
  ResourceProductionSystem,
} from "../systems";
import { NumberFormatter } from "../utils/notation";
import { WorkshopEntity } from "../workshop";
import { EntityAdmin } from "./entity-admin";
import { EntityWatcher } from "./entity-watcher";
import { TimersEntity } from "./timers";

export interface IGame {
  readonly presenter: IPresenterSystem;
  readonly interactor: {
    bonfire: IBonfireInteractor;
    gameController: IGameController;
  };
}

export class Game implements IGame {
  private readonly admin: EntityAdmin = new EntityAdmin();
  private readonly watcher: EntityWatcher = new EntityWatcher();
  private readonly updater: GameUpdater;

  private readonly _systems: GameSystems;
  private readonly _interactor: GameInteractor;
  private readonly _presenter: PresenterSystem;
  private readonly _rootPresenter: RootPresenter;

  constructor() {
    for (const entity of this.createEntities()) {
      this.admin.add(entity);
      this.watcher.watch(entity);
    }

    this._systems = new GameSystems(
      new BuildingSystem(this.admin),
      new BuildingEffectsSystem(this.admin),
      new CraftingSystem(this.admin),
      new EffectsSystem(this.admin),
      new EnvironmentSystem(this.admin),
      new LockToggleSystem(this.admin),
      new ResourceProductionSystem(this.admin),
    );

    this._systems.init();

    this.updater = new GameUpdater(
      (dt) => this.update(dt),
      new SystemTimestampProvider(),
    );

    this._rootPresenter = new RootPresenter();

    this._presenter = new PresenterSystem(
      this._rootPresenter,
      new BonfirePresenter(this._rootPresenter),
      new EnvironmentPresenter(this._rootPresenter),
      new ResourcePresenter(this._rootPresenter),
      new NumberFormatter(3),
    );

    this._interactor = new GameInteractor(new BonfireInteractor(this.admin), {
      init: () => this.flushChanges(),
      start: () => this.updater.start(),
      stop: () => this.updater.stop(),
    });
  }

  *createEntities(): IterableIterator<Entity> {
    for (const building of Object.values(BuildingMetadata)) {
      yield new BuildingEntity(building.id);
    }

    yield new EffectPoolEntity();
    yield new WorkshopEntity();
    yield new EnvironmentEntity();
    yield new TimersEntity();

    for (const resource of Object.values(ResourceMetadata)) {
      yield new ResourceEntity(resource.id);
    }
  }

  get presenter(): IPresenterSystem {
    return this._presenter;
  }

  get interactor(): GameInteractor {
    return this._interactor;
  }

  private update(dt: number): void {
    // Advance timers
    this.admin.timers().update(dt);

    // Update environment.
    this._systems.environment.update();

    // Handle buildings and building effects.
    this._systems.buildings.update();
    this._systems.buildingEffects.update();

    // Lock/unlock elements.
    this._systems.lockToggle.update();

    // Update effects pool.
    this._systems.effects.update();

    // Handle resources
    this._systems.crafting.update();
    this._systems.resourceProduction.update();

    // Push changes to presenter.
    this.flushChanges();
  }

  private flushChanges() {
    this.watcher.flush((changes) => this._rootPresenter.update(changes));
  }
}
