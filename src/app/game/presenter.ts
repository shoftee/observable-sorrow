import { IEnvironmentPresenter } from "../environment/presenter";
import { IResourcePresenter } from "../resources/presenter";
import { IWorkshopPresenter } from "../workshop/presenter";

export interface IGamePresenter {
  readonly environment: IEnvironmentPresenter;
  readonly resources: IResourcePresenter;
  readonly workshop: IWorkshopPresenter;
}

export class GamePresenter implements IGamePresenter {
  constructor(
    readonly environment: IEnvironmentPresenter,
    readonly resources: IResourcePresenter,
    readonly workshop: IWorkshopPresenter,
  ) {}
}
