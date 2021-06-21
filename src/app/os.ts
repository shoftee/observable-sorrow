import { ResourcePool, ResourcePresenter } from "./resources";
import { Environment, EnvironmentPresenter } from "./environment";
import { Workshop, WorkshopInteractor, WorkshopPresenter } from "./workshop";
import { Game } from "./game";
import { GameInteractor, IGameInteractor } from "./game/interactor";
import { GamePresenter, IGamePresenter } from "./game/presenter";
import { IGameRunner } from "./game/runner";

const resourcePool = new ResourcePool();
const environment = new Environment();
const workshop = new Workshop(resourcePool);
const environmentPresenter = new EnvironmentPresenter(environment);
const resourcePresenter = new ResourcePresenter(resourcePool);
const workshopPresenter = new WorkshopPresenter(resourcePool);
const game = new Game(
  resourcePool,
  environment,
  workshop,
  environmentPresenter,
  resourcePresenter,
  workshopPresenter,
);

const runner = game.runner;

const presenter = new GamePresenter(
  environmentPresenter,
  resourcePresenter,
  workshopPresenter,
);

const workshopInteractor = new WorkshopInteractor(workshop, runner);
const interactor = new GameInteractor(workshopInteractor);

export const Runner: IGameRunner = runner;
export const Interactor: IGameInteractor = interactor;
export const Presenter: IGamePresenter = presenter;
