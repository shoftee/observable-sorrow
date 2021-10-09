import { Entity } from "@/_ecs";
import {
  EffectId,
  GameInteractor,
  IGameController,
  InitializeOptions,
  OnTickedHandler,
} from "@/_interfaces";
import { EffectIds, Meta } from "@/_state";
import { SystemTimestamp } from "@/_utils/timestamp";

import { GameUpdater } from ".";

import {
  BuildingEntity,
  EnvironmentEntity,
  TimeEntity,
  RecipeEntity,
  ResourceEntity,
  EffectEntity,
  EntityAdmin,
  EntityWatcher,
} from "../entity";
import { BonfireInteractor } from "../interactors";
import {
  BuildingSystem,
  CraftingSystem,
  GameSystems,
  EffectsSystem,
  EnvironmentSystem,
  FulfillmentSystem,
  LockToggleSystem,
  ResourceProductionSystem,
  TimeSystem,
} from "../systems";

export class Game {
  private readonly admin: EntityAdmin;
  private readonly watcher: EntityWatcher;
  private readonly updater: GameUpdater;
  private readonly systems: GameSystems;
  private onTickedHandler?: OnTickedHandler;

  readonly interactor: GameInteractor;

  constructor() {
    this.watcher = new EntityWatcher();
    this.admin = new EntityAdmin(this.watcher);

    for (const entity of createEntities()) {
      this.admin.add(entity);
    }

    this.systems = new GameSystems(
      new BuildingSystem(this.admin),
      new CraftingSystem(this.admin),
      new EffectsSystem(this.admin),
      new EnvironmentSystem(this.admin),
      new FulfillmentSystem(this.admin),
      new LockToggleSystem(this.admin),
      new ResourceProductionSystem(this.admin),
      new TimeSystem(this.admin),
    );

    this.systems.init();

    this.updater = new GameUpdater(
      (dt) => this.update(dt),
      new SystemTimestamp(),
    );

    this.interactor = new GameInteractor(
      new BonfireInteractor(this.admin),
      new GameController(this.updater),
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

function* createEntities(): IterableIterator<Entity> {
  yield new EnvironmentEntity();
  yield new TimeEntity();

  for (const building of Meta.buildings()) {
    yield new BuildingEntity(building.id);
  }

  for (const id of EffectIds()) {
    yield new EffectEntity(id as EffectId);
  }

  for (const recipe of Meta.recipes()) {
    yield new RecipeEntity(recipe.id);
  }
  for (const resource of Meta.resources()) {
    yield new ResourceEntity(resource.id);
  }
}

class GameController implements IGameController {
  constructor(private readonly updater: GameUpdater) {}

  start(): void {
    this.updater.start();
  }

  stop(): void {
    this.updater.stop();
  }
}
