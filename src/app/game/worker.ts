import { expose } from "comlink";

import { BonfireItemId } from "@/_interfaces";

import { IRootInteractor, InitializeOptions } from "./endpoint";

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
