import { expose } from "comlink";

import {
  BonfireItemId,
  InitializeOptions,
  IRootInteractor,
  JobId,
} from "@/_interfaces";

import { Game } from "./game";
let game: Game;

const interactor: IRootInteractor = {
  initialize(options: InitializeOptions) {
    game = new Game(options);
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
  assignJob(id: JobId) {
    game.interactor.society.assignJob(id);
  },
  unassignJob(id: JobId) {
    game.interactor.society.unassignJob(id);
  },
  turnDevToolsOn() {
    game.interactor.devTools.turnDevToolsOn();
  },
  turnDevToolsOff() {
    game.interactor.devTools.turnDevToolsOff();
  },
  setGatherCatnip(amount: number) {
    game.interactor.devTools.setGatherCatnip(amount);
  },
  setTimeAcceleration(factor: number) {
    game.interactor.devTools.setTimeAcceleration(factor);
  },
};

expose(interactor);
