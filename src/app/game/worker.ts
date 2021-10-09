import { expose } from "comlink";

import {
  BonfireItemId,
  InitializeOptions,
  IRootInteractor,
} from "@/_interfaces";

import { Game } from ".";
const game = new Game();

expose(<IRootInteractor>{
  initialize(options: InitializeOptions) {
    game.initialize(options);
  },
  start() {
    game.interactor.gameController.start();
  },
  stop() {
    game.interactor.gameController.stop();
  },
  buildItem(id: BonfireItemId) {
    game.interactor.bonfire.buildItem(id);
  },
});
