import {
  LogPresenter,
  NumberFormatter,
  PlayerPresenter,
  SciencePresenter,
  SocietyPresenter,
  StateManager,
} from ".";

export class PresenterFacade {
  readonly formatter: NumberFormatter;
  readonly log: LogPresenter;
  readonly player: PlayerPresenter;
  readonly science: SciencePresenter;
  readonly society: SocietyPresenter;

  constructor(stateManager: StateManager) {
    this.log = new LogPresenter(stateManager);
    this.player = new PlayerPresenter(stateManager);
    this.science = new SciencePresenter(stateManager);
    this.society = new SocietyPresenter(stateManager);

    this.formatter = new NumberFormatter(stateManager, {
      precision: 3,
      units: "seconds",
    });
  }
}
