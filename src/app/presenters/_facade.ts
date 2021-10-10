import { SandcastleBuilderNotation } from "@/_utils/notation";

import {
  BonfirePresenter,
  EnvironmentPresenter,
  NumberFormatter,
  ResourcesPresenter,
  SectionsPresenter,
  StateManager,
} from ".";

export class PresenterFacade {
  readonly bonfire: BonfirePresenter;
  readonly environment: EnvironmentPresenter;
  readonly formatter: NumberFormatter;
  readonly sections: SectionsPresenter;
  readonly resources: ResourcesPresenter;

  constructor(private readonly manager: StateManager) {
    this.bonfire = new BonfirePresenter(this.manager);
    this.environment = new EnvironmentPresenter(this.manager);
    this.sections = new SectionsPresenter(this.manager);
    this.resources = new ResourcesPresenter(this.manager);

    this.formatter = new NumberFormatter(
      {
        precision: 3,
        units: "seconds",
      },
      new SandcastleBuilderNotation(),
    );
  }
}
