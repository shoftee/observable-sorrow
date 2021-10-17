import { expose } from "comlink";

import { BonfireItemId, JobId } from "@/_interfaces";

import { IRootInteractor, InitializeOptions } from "./endpoint";

import { Game } from "./game";
let game: Game;

const interactor: IRootInteractor = {
  initialize(options: InitializeOptions) {
    game = new Game(options);
  },
  start() {
    if (isInitialized(game)) game.interactor.controller.start();
  },
  stop() {
    if (isInitialized(game)) game.interactor.controller.stop();
  },
  buildItem(id: BonfireItemId) {
    if (isInitialized(game)) game.interactor.bonfire.buildItem(id);
  },
  assignJob(id: JobId) {
    if (isInitialized(game)) game.interactor.society.assignJob(id);
  },
  unassignJob(id: JobId) {
    if (isInitialized(game)) game.interactor.society.unassignJob(id);
  },
};

expose(interactor);

function isInitialized(game: Game | undefined): game is Game {
  if (!game) throw new Error("you need to call initialize(options) first");
  return true;
}
