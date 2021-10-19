import { expose } from "comlink";

import {
  BonfireItemId,
  InitializeOptions,
  IRootInteractor,
  JobId,
} from "@/app/interfaces";

import { Runner } from "./runner";
let runner: Runner;

const interactor: IRootInteractor = {
  initialize(options: InitializeOptions) {
    runner = new Runner(options);
  },
  start() {
    runner.interactor.controller.start();
  },
  stop() {
    runner.interactor.controller.stop();
  },
  buildItem(id: BonfireItemId) {
    runner.interactor.bonfire.buildItem(id);
  },
  assignJob(id: JobId) {
    runner.interactor.society.assignJob(id);
  },
  unassignJob(id: JobId) {
    runner.interactor.society.unassignJob(id);
  },
  turnDevToolsOn() {
    runner.interactor.devTools.turnDevToolsOn();
  },
  turnDevToolsOff() {
    runner.interactor.devTools.turnDevToolsOff();
  },
  setGatherCatnip(amount: number) {
    runner.interactor.devTools.setGatherCatnip(amount);
  },
  setTimeAcceleration(factor: number) {
    runner.interactor.devTools.setTimeAcceleration(factor);
  },
};

expose(interactor);
