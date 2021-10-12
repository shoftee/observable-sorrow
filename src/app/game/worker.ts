import { expose } from "comlink";

import {
  BonfireItemId,
  InitializeOptions,
  IRootInteractor,
} from "@/_interfaces";

import { Game } from "./game";
let game: Game;

expose(<IRootInteractor>{
  initialize(options: InitializeOptions) {
    game = new Game(options);
  },
  start() {
    if (!game) throw NotInitializedError();
    game.interactor.controller.start();
  },
  stop() {
    if (!game) throw NotInitializedError();
    game.interactor.controller.stop();
  },
  buildItem(id: BonfireItemId) {
    if (!game) throw NotInitializedError();
    game.interactor.bonfire.buildItem(id);
  },
});

function NotInitializedError() {
  return new Error("you need to call initialize(options) first");
}
