import { OnTickedHandler } from "@/app/interfaces";
import { SaveSlot } from "@/app/store/db";
import { SystemTimestamp } from "@/app/utils/timestamp";

import { EntityAdmin, EntityWatcher } from "./entity";
import { InteractorFacade, GameController } from "./interactors";
import { GameSystems } from "./systems";

export class Runner {
  private readonly admin: EntityAdmin;
  private readonly watcher: EntityWatcher;
  private readonly systems: GameSystems;
  private readonly onTickedHandler: OnTickedHandler;

  readonly interactor: InteractorFacade;

  constructor(onTicked: OnTickedHandler, saveSlot: SaveSlot) {
    this.onTickedHandler = onTicked;

    this.watcher = new EntityWatcher();
    this.admin = new EntityAdmin(this.watcher);

    const controller = new GameController(
      this.admin,
      (dt) => this.update(dt),
      new SystemTimestamp(),
    );

    this.interactor = new InteractorFacade(controller, this.admin);
    this.interactor.store.load(saveSlot);

    this.systems = new GameSystems(this.admin);
    this.systems.init();
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
      this.onTickedHandler(changes);
    });
  }
}
