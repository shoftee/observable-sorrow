import { IBonfireInteractor } from "../bonfire";

export interface IGameInteractor {
  readonly bonfire: IBonfireInteractor;
}

export class GameInteractor implements IGameInteractor {
  constructor(readonly bonfire: IBonfireInteractor) {}
}
