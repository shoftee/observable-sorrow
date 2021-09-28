import { IBonfirePresenter } from "../bonfire/presenter";
import { IEnvironmentPresenter } from "../environment/presenter";
import { IResourcePresenter } from "../resources/presenter";
import { NumberFormatter } from "../utils/notation";

export interface IPresenterSystem {
  readonly bonfire: IBonfirePresenter;
  readonly environment: IEnvironmentPresenter;
  readonly resources: IResourcePresenter;
  readonly numbers: NumberFormatter;
}

export class PresenterSystem implements IPresenterSystem {
  constructor(
    readonly bonfire: IBonfirePresenter,
    readonly environment: IEnvironmentPresenter,
    readonly resources: IResourcePresenter,
    readonly numbers: NumberFormatter,
  ) {}
}
