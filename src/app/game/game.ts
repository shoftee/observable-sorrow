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
import {
  BuildingMetadata,
  ProductionEffectMetadata,
  ResourceMetadata,
} from "../core/metadata";
import { ProductionEffectEntity } from "../effects";
import { EnvironmentEntity, EnvironmentPresenter } from "../environment";
import { ResourceEntity, ResourcePresenter } from "../resources";
import {
  IGameSystems,
  GameSystems,
  BuildingSystem,
  BuildingEffectsSystem,
  CalendarSystem,
  CraftingSystem,
  LockToggleSystem,
  ResourceProductionSystem,
  TransactionSystem,
} from "../systems";
import { SandcastleBuilderNotation } from "../utils/notation";
import { WorkshopEntity } from "../workshop";
import { EntityAdmin } from "./entity-admin";
import { TimersEntity } from "./timers";

export interface IGame {
  readonly runner: IGameRunner;
  readonly systems: IGameSystems;
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
    for (const effect of Object.values(ProductionEffectMetadata)) {
      this.admin.add(new ProductionEffectEntity(this.admin, effect.id));
    }
    for (const resource of Object.values(ResourceMetadata)) {
      this.admin.add(new ResourceEntity(this.admin, resource.id));
    }
    this.admin.add(new WorkshopEntity(this.admin));
    this.admin.add(new EnvironmentEntity(this.admin));
    this.admin.add(new TimersEntity(this.admin));
    this.admin.init();

    this._systems = new GameSystems(
      new BuildingSystem(this.admin),
      new BuildingEffectsSystem(this.admin),
      new CalendarSystem(this.admin),
      new CraftingSystem(this.admin),
      new LockToggleSystem(this.admin),
      new ResourceProductionSystem(this.admin),
      new TransactionSystem(this.admin),
    );

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
      new SandcastleBuilderNotation(),
    );

    this._interactor = new InteractorSystem(
      new BonfireInteractor(
        this._runner,
        this._systems.buildings,
        this._systems.crafting,
        this._systems.transactions,
      ),
    );
  }

  get runner(): IGameRunner {
    return this._runner;
  }

  get systems(): IGameSystems {
    return this._systems;
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

    this._systems.calendar.update();

    this._systems.crafting.update();
    this._systems.transactions.update();
    this._systems.buildings.update();
    this._systems.buildingEffects.update();
    this._systems.lockToggle.update();

    this._systems.resourceProduction.update();

    this._presenter.environment.render();
    this._presenter.resources.render();
    this._presenter.bonfire.render();
  }
}
