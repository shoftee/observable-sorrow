import { BonfireItemId, IGameRunner } from ".";

export interface IInteractorSystem {
  readonly bonfire: IBonfireInteractor;
  readonly runner: IGameRunner;
}

export interface IBonfireInteractor {
  buildItem(id: BonfireItemId): void;
}
