import { IBonfirePresenter } from "../bonfire/presenter";
import { IEnvironmentPresenter } from "../environment/presenter";
import { IResourcePresenter } from "../resources/presenter";
import { INumberNotation } from "../utils/notation";

export interface IPresenterSystem {
  readonly bonfire: IBonfirePresenter;
  readonly environment: IEnvironmentPresenter;
  readonly resources: IResourcePresenter;
  readonly numbers: INumberNotation;
}

export class PresenterSystem implements IPresenterSystem {
  constructor(
    readonly bonfire: IBonfirePresenter,
    readonly environment: IEnvironmentPresenter,
    readonly resources: IResourcePresenter,
    readonly numbers: INumberNotation,
  ) {}
}
