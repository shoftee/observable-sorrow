import { OnTickedHandler, InitializeOptions } from "@/app/interfaces";
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

  constructor(options: InitializeOptions) {
    this.onTickedHandler = options.onTicked;

    this.watcher = new EntityWatcher();
    this.admin = new EntityAdmin(this.watcher);

    this.systems = new GameSystems(this.admin);

    this.systems.init();
    this.update(0);

    const controller = new GameController(
      this.admin,
      (dt) => this.update(dt),
      new SystemTimestamp(),
    );

    this.interactor = new InteractorFacade(controller, this.admin);
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
