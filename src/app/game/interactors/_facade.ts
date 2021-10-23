import { EntityAdmin } from "../entity";

import {
  BonfireInteractor,
  DevToolsInteractor,
  GameController,
  SocietyInteractor,
  StoreInteractor,
} from ".";

export class InteractorFacade {
  readonly bonfire: BonfireInteractor;
  readonly devTools: DevToolsInteractor;
  readonly society: SocietyInteractor;
  readonly store: StoreInteractor;

  constructor(readonly controller: GameController, admin: EntityAdmin) {
    this.bonfire = new BonfireInteractor(admin);
    this.devTools = new DevToolsInteractor(admin);
    this.society = new SocietyInteractor(admin);
    this.store = new StoreInteractor(admin);
  }
}
