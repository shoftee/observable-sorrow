import { IBonfirePresenter } from "../bonfire/presenter";
import { IEnvironmentPresenter } from "../environment/presenter";
import { IResourcePresenter } from "../resources/presenter";

export interface IGamePresenter {
  readonly bonfire: IBonfirePresenter;
  readonly environment: IEnvironmentPresenter;
  readonly resources: IResourcePresenter;
}

export class GamePresenter implements IGamePresenter {
  constructor(
    readonly bonfire: IBonfirePresenter,
    readonly environment: IEnvironmentPresenter,
    readonly resources: IResourcePresenter,
  ) {}
}
