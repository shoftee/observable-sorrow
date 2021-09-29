import { Game } from "./game";
import { IPresenterSystem } from "./game/presenter";
import { IInteractorSystem } from "@/_interfaces/interactor";

const game = new Game();

export const Interactor: IInteractorSystem = game.interactor;
export const Presenter: IPresenterSystem = game.presenter;
