import { BonfireItemId } from ".";

export interface IBonfireInteractor {
  buildItem(id: BonfireItemId): void;
}

export interface IGameController {
  init(): void;
  start(): void;
  stop(): void;
}
