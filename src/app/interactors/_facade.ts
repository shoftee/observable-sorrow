import {
  IGameController,
  IBonfireInteractor,
  ISocietyInteractor,
  IDevToolsInteractor,
} from "../game/endpoint";

export class InteractorFacade {
  constructor(
    readonly controller: IGameController,
    readonly bonfire: IBonfireInteractor,
    readonly society: ISocietyInteractor,
    readonly devTools: IDevToolsInteractor,
  ) {}
}
