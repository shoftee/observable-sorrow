import {
  IBonfireInteractor,
  IDevToolsInteractor,
  IGameController,
  ISocietyInteractor,
} from "@/app/interfaces";

import { EntityAdmin } from "../entity";

import { BonfireInteractor, SocietyInteractor, DevToolsInteractor } from ".";

export class InteractorFacade {
  readonly bonfire: IBonfireInteractor;
  readonly society: ISocietyInteractor;
  readonly devTools: IDevToolsInteractor;

  constructor(readonly controller: IGameController, admin: EntityAdmin) {
    this.bonfire = new BonfireInteractor(admin);
    this.society = new SocietyInteractor(admin);
    this.devTools = new DevToolsInteractor(admin);
  }
}
