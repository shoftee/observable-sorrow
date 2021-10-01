import { IBonfireInteractor, IGameController } from "@/_interfaces";

export class GameInteractor {
  constructor(
    readonly bonfire: IBonfireInteractor,
    readonly gameController: IGameController,
  ) {}
}
