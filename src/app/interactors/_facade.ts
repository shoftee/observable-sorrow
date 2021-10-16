import { IGameController, IBonfireInteractor } from "../game/endpoint";

export class InteractorFacade {
  constructor(
    readonly controller: IGameController,
    readonly bonfire: IBonfireInteractor,
  ) {}
}
