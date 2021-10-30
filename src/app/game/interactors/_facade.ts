import { EntityAdmin } from "../entity";

import {
  DevToolsInteractor,
  Dispatcher,
  GameController,
  StoreInteractor,
} from ".";

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
