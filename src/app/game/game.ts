import { InitializeOptions, OnTickedHandler } from "@/_interfaces";
import { SystemTimestamp } from "@/_utils/timestamp";

import { EntityAdmin, EntityWatcher } from "../entity";
import {
  BuildingSystem,
  CraftingSystem,
  GameSystems,
  EffectsSystem,
  EnvironmentSystem,
  FulfillmentSystem,
  LockToggleSystem,
  PopulationSystem,
  ResourceProductionSystem,
  TimeSystem,
} from "../systems";

import {
  InteractorFacade,
  BonfireInteractor,
  GameController,
} from "../interactors";

export class Game {
  private readonly admin: EntityAdmin;
  private readonly watcher: EntityWatcher;
  private readonly systems: GameSystems;
  private readonly onTickedHandler: OnTickedHandler;

  readonly interactor: InteractorFacade;

  constructor(options: InitializeOptions) {
    this.onTickedHandler = options.onTicked;

    this.watcher = new EntityWatcher();
    this.admin = new EntityAdmin(this.watcher);

    this.systems = new GameSystems(
      new BuildingSystem(this.admin),
      new CraftingSystem(this.admin),
      new EffectsSystem(this.admin),
      new EnvironmentSystem(this.admin),
      new FulfillmentSystem(this.admin),
      new LockToggleSystem(this.admin),
      new PopulationSystem(this.admin),
      new ResourceProductionSystem(this.admin),
      new TimeSystem(this.admin),
    );

    this.systems.init();
    this.update(0);

    const controller = new GameController(
      (dt) => this.update(dt),
      new SystemTimestamp(),
    );

    this.interactor = new InteractorFacade(
      controller,
      new BonfireInteractor(this.admin),
    );
  }

  private update(dt: number): void {
    // Run updates on all systems.
    this.systems.update(dt);

    // Push changes to presenter.
    this.flushChanges();
  }

  private flushChanges() {
    this.watcher.flush((changes) => {
      this.onTickedHandler(changes);
    });
  }
}
