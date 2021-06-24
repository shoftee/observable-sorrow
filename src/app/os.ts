import { Game } from "./game";
import { IInteractorSystem } from "./game/interactor";
import { IPresenterSystem } from "./game/presenter";
import { IGameRunner } from "./game/runner";

const game = new Game();

export const Runner: IGameRunner = game.runner;
export const Interactor: IInteractorSystem = game.interactor;
export const Presenter: IPresenterSystem = game.presenter;
