import { BonfireInteractor, BonfirePresenter } from "./bonfire";
import { Environment, EnvironmentPresenter } from "./environment";
import { ResourcePool, ResourcePresenter } from "./resources";
import { Workshop } from "./workshop";
import { Game } from "./game";
import { GameInteractor, IGameInteractor } from "./game/interactor";
import { GamePresenter, IGamePresenter } from "./game/presenter";
import { IGameRunner } from "./game/runner";

const resourcePool = new ResourcePool();
const environment = new Environment();
const workshop = new Workshop(resourcePool);
const environmentPresenter = new EnvironmentPresenter(environment);
const resourcePresenter = new ResourcePresenter(resourcePool);
const bonfirePresenter = new BonfirePresenter(resourcePool);
const game = new Game(
  resourcePool,
  environment,
  workshop,
  environmentPresenter,
  resourcePresenter,
  bonfirePresenter,
);

const runner = game.runner;

const presenter = new GamePresenter(
  bonfirePresenter,
  environmentPresenter,
  resourcePresenter,
);

const bonfireInteractor = new BonfireInteractor(workshop, runner);
const interactor = new GameInteractor(bonfireInteractor);

export const Runner: IGameRunner = runner;

export const Interactor: IGameInteractor = interactor;
export const Presenter: IGamePresenter = presenter;
