import { IWorkshopInteractor } from "../workshop";

export interface IGameInteractor {
  readonly workshop: IWorkshopInteractor;
}

export class GameInteractor implements IGameInteractor {
  constructor(readonly workshop: IWorkshopInteractor) {}
}
