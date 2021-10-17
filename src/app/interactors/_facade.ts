import {
  IGameController,
  IBonfireInteractor,
  ISocietyInteractor,
} from "../game/endpoint";

export class InteractorFacade {
  constructor(
    readonly controller: IGameController,
    readonly bonfire: IBonfireInteractor,
    readonly society: ISocietyInteractor,
  ) {}
}
