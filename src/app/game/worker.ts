import { expose } from "comlink";

import { Intent, IRootInteractor, OnRenderHandler } from "@/app/interfaces";

import { Game } from "./game";

let game: Game;
const interactor: IRootInteractor = {
  initialize(onRender: OnRenderHandler) {
    if (game !== undefined) {
      game.stop();
    }
    game = new Game(onRender);
  },
  start() {
    game.start();
  },
  stop() {
    game.stop();
  },
  send(intent: Intent) {
    game.dispatch(intent);
  },
};

expose(interactor);
