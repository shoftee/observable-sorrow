import { expose } from "comlink";

import {
  BonfireItemId,
  InitializeOptions,
  IRootInteractor,
} from "@/_interfaces";

import { Game } from "./game";
const game = new Game();

expose(<IRootInteractor>{
  initialize(options: InitializeOptions) {
    game.initialize(options);
  },
  start() {
    game.interactor.controller.start();
  },
  stop() {
    game.interactor.controller.stop();
  },
  buildItem(id: BonfireItemId) {
    game.interactor.bonfire.buildItem(id);
  },
});
