import LimitsManager from "../effects/limits/manager";
import EnvironmentManager from "../environment/manager";
import ResourceManager from "../resources/manager";
import TimeManager from "../time/manager";
import Updater from "./updater";
import ControlsInteractor from "../interactors/controls/interactor";
import EnvironmentInteractor from "../interactors/environment/interactor";
import ResourcesInteractor from "../interactors/resources/interactor";

interface IGame {
  readonly managers: IGameManagers;
  readonly interactors: IGameInteractors;

  start(): void;
}

interface IRegisterInGame {
  register(game: IGame): void;
}

interface IGameManagers {
  readonly time: TimeManager;
  readonly updater: Updater;
  readonly environment: EnvironmentManager;
  readonly resources: ResourceManager;
  readonly limits: LimitsManager;
}

interface IGameInteractors {
  readonly controls: ControlsInteractor;
  readonly environment: EnvironmentInteractor;
  readonly resources: ResourcesInteractor;
}

class Game implements IGame {
  readonly managers: IGameManagers = {
    time: new TimeManager(),
    updater: new Updater(),
    environment: new EnvironmentManager(),
    resources: new ResourceManager(),
    limits: new LimitsManager(),
  };

  readonly interactors: IGameInteractors = {
    controls: new ControlsInteractor(),
    environment: new EnvironmentInteractor(),
    resources: new ResourcesInteractor(),
  };

  constructor() {
    this.register(this.managers.updater);
    this.register(this.managers.environment);

    this.register(this.interactors.controls);
    this.register(this.interactors.environment);
    this.register(this.interactors.resources);
  }

  private register(target: IRegisterInGame) {
    target.register(this);
  }

  start(): void {
    this.managers.time.start();
  }
}

export { Game, IGame, IRegisterInGame };
