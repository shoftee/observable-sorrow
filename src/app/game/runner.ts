import { OnEventHandler, OnMutationHandler } from "@/app/interfaces";
import { SaveSlot } from "@/app/store/db";
import { SystemTimestamp } from "@/app/utils/timestamp";

import { EntityAdmin, EntityWatcher } from "./entity";
import { InteractorFacade, GameController } from "./interactors";
import { GameSystems } from "./systems";

export class Runner {
  private readonly admin: EntityAdmin;
  private readonly watcher: EntityWatcher;
  private readonly systems: GameSystems;

  private readonly onTickedHandler: OnMutationHandler;
  private readonly onLogEventHandler: OnEventHandler;

  readonly interactor: InteractorFacade;

  constructor(
    onMutation: OnMutationHandler,
    onLogEvent: OnEventHandler,
    saveSlot: SaveSlot,
  ) {
    this.onTickedHandler = onMutation;
    this.onLogEventHandler = onLogEvent;

    this.watcher = new EntityWatcher();
    this.admin = new EntityAdmin(this.watcher);

    const controller = new GameController(
      this.admin,
      (dt) => this.update(dt),
      () => this.render(),
      new SystemTimestamp(),
    );

    this.interactor = new InteractorFacade(controller, this.admin);
    this.interactor.store.load(saveSlot);

    this.systems = new GameSystems(this.admin);
    this.systems.init();

    // Run a virtual tick.
    this.update(0);
    this.render();
  }

  private update(dt: number): void {
    // Run updates on all systems.
    this.systems.update(dt);
  }

  private render() {
    // Push changes to presenter.
    this.watcher.flushMutations((changes) => {
      this.onTickedHandler(changes);
    });
    this.watcher.flushEvents((logEvents) => {
      this.onLogEventHandler(logEvents);
    });
  }
}
