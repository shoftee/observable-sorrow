import { EntityAdmin } from "../entity";

import { DevToolsInteractor, GameController, StoreInteractor } from ".";
import { Dispatcher } from "./command";

export class InteractorFacade {
  readonly devTools: DevToolsInteractor;
  readonly dispatcher: Dispatcher;
  readonly store: StoreInteractor;

  constructor(readonly controller: GameController, admin: EntityAdmin) {
    this.dispatcher = new Dispatcher(admin);
    this.devTools = new DevToolsInteractor(admin);
    this.store = new StoreInteractor(admin);
  }
}
