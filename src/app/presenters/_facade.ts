import { SandcastleBuilderNotation } from "@/_utils/notation";

import {
  BonfirePresenter,
  EnvironmentPresenter,
  NumberFormatter,
  PlayerPresenter,
  ResourcesPresenter,
  SectionsPresenter,
  SocietyPresenter,
  StateManager,
} from ".";

export class PresenterFacade {
  readonly bonfire: BonfirePresenter;
  readonly environment: EnvironmentPresenter;
  readonly formatter: NumberFormatter;
  readonly player: PlayerPresenter;
  readonly resources: ResourcesPresenter;
  readonly sections: SectionsPresenter;
  readonly society: SocietyPresenter;

  constructor(private readonly manager: StateManager) {
    this.bonfire = new BonfirePresenter(this.manager);
    this.environment = new EnvironmentPresenter(this.manager);
    this.player = new PlayerPresenter(this.manager);
    this.resources = new ResourcesPresenter(this.manager);
    this.sections = new SectionsPresenter(this.manager);
    this.society = new SocietyPresenter(this.manager);

    this.formatter = new NumberFormatter(
      this.manager,
      new SandcastleBuilderNotation(),
      { precision: 3, units: "seconds" },
    );
  }
}
