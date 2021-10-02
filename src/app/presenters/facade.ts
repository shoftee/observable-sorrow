import { NumberFormatter } from "@/_utils/notation";

import {
  BonfirePresenter,
  EnvironmentPresenter,
  ResourcePresenter,
  Updater,
} from ".";

export class PresenterFacade {
  readonly bonfire: BonfirePresenter;
  readonly environment: EnvironmentPresenter;
  readonly resources: ResourcePresenter;
  readonly numbers: NumberFormatter;

  constructor(readonly root: Updater) {
    this.bonfire = new BonfirePresenter(this.root);
    this.environment = new EnvironmentPresenter(this.root);
    this.resources = new ResourcePresenter(this.root);
    this.numbers = new NumberFormatter(3);
  }
}
