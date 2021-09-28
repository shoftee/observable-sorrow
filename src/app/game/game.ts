import {
  IGameRunner,
  IPresenterSystem,
  IInteractorSystem,
  GameUpdater,
  PresenterSystem,
  InteractorSystem,
} from ".";
import { BonfirePresenter, BonfireInteractor } from "../bonfire";
import { BuildingEntity } from "../buildings";
import { SystemTimestampProvider } from "../core";
import { BuildingMetadata, ResourceMetadata } from "../core/metadata";
import { ChangeTrackedEntity } from "../ecs";
import { EffectPoolEntity } from "../effects";
import { EnvironmentEntity, EnvironmentPresenter } from "../environment";
import { ResourceEntity, ResourcePresenter } from "../resources";
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
import { TimersEntity } from "./timers";

export interface IGame {
  readonly runner: IGameRunner;
  readonly presenter: IPresenterSystem;
  readonly interactor: IInteractorSystem;
}

export class Game implements IGame {
  private readonly admin: EntityAdmin = new EntityAdmin();
  private readonly updater: GameUpdater;
  private readonly _runner: IGameRunner;

  private readonly _systems: GameSystems;
  private readonly _presenter: PresenterSystem;
  private readonly _interactor: InteractorSystem;

  constructor() {
    for (const building of Object.values(BuildingMetadata)) {
      this.admin.add(new BuildingEntity(this.admin, building.id));
    }

    this.admin.add(new EffectPoolEntity(this.admin));
    this.admin.add(new WorkshopEntity(this.admin));
    this.admin.add(new EnvironmentEntity(this.admin));
    this.admin.add(new TimersEntity(this.admin));

    for (const resource of Object.values(ResourceMetadata)) {
      this.admin.add(new ResourceEntity(this.admin, resource.id));
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

    this._runner = {
      start: () => this.updater.start(),
      stop: () => this.updater.stop(),
      forceUpdate: () => this.updater.force(),
    };

    this._presenter = new PresenterSystem(
      new BonfirePresenter(this.admin),
      new EnvironmentPresenter(this.admin),
      new ResourcePresenter(this.admin),
      new NumberFormatter(3),
    );

    this._interactor = new InteractorSystem(
      new BonfireInteractor(this._runner, this.admin),
    );
  }

  get runner(): IGameRunner {
    return this._runner;
  }

  get presenter(): IPresenterSystem {
    return this._presenter;
  }

  get interactor(): IInteractorSystem {
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

    this._presenter.environment.render();
    this._presenter.resources.render();
    this._presenter.bonfire.render();

    // Clear tracked changes for this tick.
    for (const entity of this.admin.pool.values()) {
      if (entity instanceof ChangeTrackedEntity) {
        entity.changes.clear();
      }
    }
  }
}
