import { EntityAdmin } from "../entity";

import {
  BonfireInteractor,
  DevToolsInteractor,
  GameController,
  ScienceInteractor,
  SocietyInteractor,
  StoreInteractor,
} from ".";

export class InteractorFacade {
  readonly bonfire: BonfireInteractor;
  readonly devTools: DevToolsInteractor;
  readonly science: ScienceInteractor;
  readonly society: SocietyInteractor;
  readonly store: StoreInteractor;

  constructor(readonly controller: GameController, admin: EntityAdmin) {
    this.bonfire = new BonfireInteractor(admin);
    this.devTools = new DevToolsInteractor(admin);
    this.science = new ScienceInteractor(admin);
    this.society = new SocietyInteractor(admin);
    this.store = new StoreInteractor(admin);
  }
}
