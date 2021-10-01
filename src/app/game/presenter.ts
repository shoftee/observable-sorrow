import {
  RootPresenter,
  IBonfirePresenter,
  IEnvironmentPresenter,
  IResourcePresenter,
} from "../presenters";
import { NumberFormatter } from "../utils/notation";

export interface IPresenterSystem {
  readonly root: RootPresenter;
  readonly bonfire: IBonfirePresenter;
  readonly environment: IEnvironmentPresenter;
  readonly resources: IResourcePresenter;
  readonly numbers: NumberFormatter;
}

export class PresenterSystem implements IPresenterSystem {
  constructor(
    readonly root: RootPresenter,
    readonly bonfire: IBonfirePresenter,
    readonly environment: IEnvironmentPresenter,
    readonly resources: IResourcePresenter,
    readonly numbers: NumberFormatter,
  ) {}
}
