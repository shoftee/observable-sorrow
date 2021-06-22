import { IBonfirePresenter } from "../bonfire/presenter";
import { IEnvironmentPresenter } from "../environment/presenter";
import { IResourcePresenter } from "../resources/presenter";

export interface IPresenterSystem {
  readonly bonfire: IBonfirePresenter;
  readonly environment: IEnvironmentPresenter;
  readonly resources: IResourcePresenter;
}

export class PresenterSystem implements IPresenterSystem {
  constructor(
    readonly bonfire: IBonfirePresenter,
    readonly environment: IEnvironmentPresenter,
    readonly resources: IResourcePresenter,
  ) {}
}
