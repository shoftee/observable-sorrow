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
  private onTickedHandler?: OnTickedHandler;

  readonly interactor: InteractorFacade;

  constructor() {
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

    const controller = new GameController(
      (dt) => this.update(dt),
      new SystemTimestamp(),
    );

    this.interactor = new InteractorFacade(
      controller,
      new BonfireInteractor(this.admin),
    );
  }

  public initialize(options: InitializeOptions): void {
    this.onTickedHandler = options.onTicked;
    this.update(0);
  }

  private update(dt: number): void {
    // Run updates on all systems.
    this.systems.update(dt);

    // Push changes to presenter.
    this.flushChanges();
  }

  private flushChanges() {
    this.watcher.flush((changes) => {
      if (!this.onTickedHandler)
        throw new Error(
          "undefined ticked handler, make sure you call gameController.onTicked(options) before gameController.start()",
        );
      this.onTickedHandler(changes);
    });
  }
}
