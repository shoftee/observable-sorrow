import { expose } from "comlink";

import {
  Intent,
  IRootInteractor,
  OnEventHandler,
  OnMutationHandler,
} from "@/app/interfaces";

import { Runner } from "./runner";

let runner: Runner;
const interactor: IRootInteractor = {
  async initialize(
    onMutation: OnMutationHandler,
    onEvent: OnEventHandler,
  ): Promise<void> {
    if (runner !== undefined) {
      runner.interactor.controller.stop();
    }
    runner = new Runner(onMutation, onEvent);
  },
  // game controls
  start() {
    runner.interactor.controller.start();
  },
  stop() {
    runner.interactor.controller.stop();
  },
  // store
  async load() {
    await runner.interactor.store.load();
  },
  async save() {
    await runner.interactor.store.save();
  },
  // command dispatch
  async send(intent: Intent) {
    await runner.interactor.dispatcher.send(intent);
  },
  // devtools
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
