import { BonfireInteractor, BonfirePresenter } from "./bonfire";
import { Environment, EnvironmentPresenter } from "./environment";
import { ResourcePool, ResourcePresenter } from "./resources";
import { Workshop } from "./workshop";
import { Game } from "./game";
import { InteractorSystem, IInteractorSystem } from "./game/interactor";
import { PresenterSystem, IPresenterSystem } from "./game/presenter";
import { IGameRunner } from "./game/runner";
import { BuildingPool } from "./buildings/pool";

const resourcePool = new ResourcePool();
const buildingPool = new BuildingPool(resourcePool);
const environment = new Environment();
const workshop = new Workshop(resourcePool);
const environmentPresenter = new EnvironmentPresenter(environment);
const resourcePresenter = new ResourcePresenter(resourcePool);
const bonfirePresenter = new BonfirePresenter(buildingPool, resourcePool);
const game = new Game(
  buildingPool,
  environment,
  resourcePool,
  workshop,
  environmentPresenter,
  resourcePresenter,
  bonfirePresenter,
);

const runner = game.runner;

const presenter = new PresenterSystem(
  bonfirePresenter,
  environmentPresenter,
  resourcePresenter,
);

const bonfireInteractor = new BonfireInteractor(
  runner,
  buildingPool,
  resourcePool,
  workshop,
);
const interactor = new InteractorSystem(bonfireInteractor);

export const Runner: IGameRunner = runner;

export const Interactor: IInteractorSystem = interactor;
export const Presenter: IPresenterSystem = presenter;
