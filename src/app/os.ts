import { ResourcePool, ResourcePresenter } from "./resources";
import { Environment, EnvironmentPresenter } from "./environment";
import { Workshop, WorkshopPresenter } from "./workshop";
import { Game } from "./game";
import { GamePresenter, IGamePresenter } from "./game/presenter";
import { IGameRunner } from "./game/runner";

const resourcePool = new ResourcePool();
const environment = new Environment();
const workshop = new Workshop(resourcePool);
const environmentPresenter = new EnvironmentPresenter(environment);
const resourcePresenter = new ResourcePresenter(resourcePool);
const game = new Game(
  resourcePool,
  environment,
  workshop,
  environmentPresenter,
  resourcePresenter,
);

const runner = game.runner;

const workshopPresenter = new WorkshopPresenter(workshop, runner);
const presenter = new GamePresenter(
  environmentPresenter,
  resourcePresenter,
  workshopPresenter,
);

export const Presenter: IGamePresenter = presenter;
export const Runner: IGameRunner = runner;
