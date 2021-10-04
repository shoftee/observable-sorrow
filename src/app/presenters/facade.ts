import { SandcastleBuilderNotation } from "@/_utils/notation";

import {
  BonfirePresenter,
  EnvironmentPresenter,
  NumberFormatter,
  ResourcesPresenter,
  Updater,
} from ".";

export class PresenterFacade {
  readonly bonfire: BonfirePresenter;
  readonly environment: EnvironmentPresenter;
  readonly resources: ResourcesPresenter;
  readonly formatter: NumberFormatter;

  constructor(readonly root: Updater) {
    this.bonfire = new BonfirePresenter(this.root);
    this.environment = new EnvironmentPresenter(this.root);
    this.resources = new ResourcesPresenter(this.root);
    this.formatter = new NumberFormatter(3, new SandcastleBuilderNotation());
  }
}
