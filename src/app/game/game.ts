import { Entity } from "@/_ecs";
import {
  EffectId,
  GameInteractor,
  IGameController,
  OnTickedHandler,
} from "@/_interfaces";
import {
  BuildingMetadata,
  EffectIds,
  RecipeMetadata,
  ResourceMetadata,
} from "@/_state";
import { SystemTimestamp } from "@/_utils/timestamp";

import { GameUpdater } from ".";

import {
  BuildingEntity,
  EnvironmentEntity,
  TimersEntity,
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
} from "../systems";

class GameController implements IGameController {
  constructor(
    private readonly updater: GameUpdater,
    private readonly setter: (handler: OnTickedHandler) => void,
  ) {}

  start(): void {
    this.updater.start();
  }
  stop(): void {
    this.updater.stop();
  }

  onTicked(handler: OnTickedHandler): void {
    this.setter(handler);
  }
}

export class Game {
  private readonly admin: EntityAdmin;
  private readonly watcher: EntityWatcher;
  private readonly updater: GameUpdater;

  private readonly _systems: GameSystems;
  private readonly _interactor: GameInteractor;

  private onTickedHandler?: OnTickedHandler;

  constructor() {
    this.watcher = new EntityWatcher();
    this.admin = new EntityAdmin(this.watcher);

    for (const entity of this.createEntities()) {
      this.admin.add(entity);
    }

    this._systems = new GameSystems(
      new BuildingSystem(this.admin),
      new CraftingSystem(this.admin),
      new EffectsSystem(this.admin),
      new EnvironmentSystem(this.admin),
      new FulfillmentSystem(this.admin),
      new LockToggleSystem(this.admin),
      new ResourceProductionSystem(this.admin),
    );

    this._systems.init();

    this.updater = new GameUpdater(
      (dt) => this.update(dt),
      new SystemTimestamp(),
    );

    this._interactor = new GameInteractor(
      new BonfireInteractor(this.admin),
      new GameController(this.updater, (handler) => {
        this.onTickedHandler = handler;
        this.update(0);
      }),
    );
  }

  *createEntities(): IterableIterator<Entity> {
    yield new EnvironmentEntity();
    yield new TimersEntity();

    for (const building of Object.values(BuildingMetadata)) {
      yield new BuildingEntity(building.id);
    }

    for (const id of EffectIds()) {
      yield new EffectEntity(id as EffectId);
    }

    for (const recipe of Object.values(RecipeMetadata)) {
      yield new RecipeEntity(recipe.id);
    }
    for (const resource of Object.values(ResourceMetadata)) {
      yield new ResourceEntity(resource.id);
    }
  }

  get interactor(): GameInteractor {
    return this._interactor;
  }

  private update(dt: number): void {
    // Advance timers
    this.admin.timers().update(dt);

    // Run updates on all systems.
    this._systems.update();

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
