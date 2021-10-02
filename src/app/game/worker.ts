import { expose } from "comlink";

import { BonfireItemId, IRootInteractor, OnTickedHandler } from "@/_interfaces";

import { Game } from ".";
const game = new Game();

const interactor: IRootInteractor = {
  onTicked(handler: OnTickedHandler) {
    game.interactor.gameController.onTicked(handler);
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
};

expose(interactor);
