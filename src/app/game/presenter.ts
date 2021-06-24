import { IBonfirePresenter } from "../bonfire/presenter";
import { IEnvironmentPresenter } from "../environment/presenter";
import { IResourcePresenter } from "../resources/presenter";

export interface INumberNotation {
  display(value: number, precision: 2 | 3, showSign: boolean): string;
}

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
