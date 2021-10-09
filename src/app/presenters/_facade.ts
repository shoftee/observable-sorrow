import { SandcastleBuilderNotation } from "@/_utils/notation";

import {
  BonfirePresenter,
  EnvironmentPresenter,
  NumberFormatter,
  ResourcesPresenter,
  StateManager,
} from ".";

export class PresenterFacade {
  readonly bonfire: BonfirePresenter;
  readonly environment: EnvironmentPresenter;
  readonly resources: ResourcesPresenter;
  readonly formatter: NumberFormatter;

  constructor(private readonly manager: StateManager) {
    this.bonfire = new BonfirePresenter(this.manager);
    this.environment = new EnvironmentPresenter(this.manager);
    this.resources = new ResourcesPresenter(this.manager);
    this.formatter = new NumberFormatter(3, new SandcastleBuilderNotation());
  }
}
