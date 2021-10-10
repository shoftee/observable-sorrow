import { IBonfireInteractor, IGameController } from "@/_interfaces";

export class InteractorFacade {
  constructor(
    readonly controller: IGameController,
    readonly bonfire: IBonfireInteractor,
  ) {}
}
