import { BuildingMetadata, ResourceMetadata } from "@/_state";
import { SystemTimestamp } from "@/_utils/timestamp";
import {
  GameInteractor,
  IGameController,
  OnTickedHandler,
} from "@/_interfaces";

import { EntityAdmin, EntityWatcher, GameUpdater } from ".";

import { Entity } from "../ecs";
import { BuildingEntity } from "../buildings";
import { EffectPoolEntity } from "../effects";
import { EnvironmentEntity } from "../environment";
import { ResourceEntity } from "../resources";
import { WorkshopEntity } from "../workshop";
import { TimersEntity } from "./timers";

import { BonfireInteractor } from "../bonfire";
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
  private readonly admin: EntityAdmin = new EntityAdmin();
  private readonly watcher: EntityWatcher = new EntityWatcher();
  private readonly updater: GameUpdater;

  private readonly _systems: GameSystems;
  private readonly _interactor: GameInteractor;

  private onTickedHandler?: OnTickedHandler;

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
    this.watcher.flush((changes) => {
      if (!this.onTickedHandler)
        throw new Error(
          "undefined ticked handler, make sure you call gameController.onTicked(options) before gameController.start()",
        );
      this.onTickedHandler(changes);
    });
  }
}
