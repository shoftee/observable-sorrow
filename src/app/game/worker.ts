import { expose } from "comlink";

import {
  BonfireItemId,
  IRootInteractor,
  JobId,
  OnTickedHandler,
  TechnologyId,
} from "@/app/interfaces";

import { Runner } from "./runner";

import { loadSlot, newSlot, SaveSlot, setCurrentSlot } from "@/app/store/db";

async function load(id: number | undefined): Promise<SaveSlot> {
  if (!id) {
    id = await newSlot();
  }

  const slot = await loadSlot(id);
  await setCurrentSlot(id);

  return slot;
}

let runner: Runner;
const interactor: IRootInteractor = {
  async initialize(
    onTicked: OnTickedHandler,
    saveSlot: number | undefined,
  ): Promise<void> {
    if (runner !== undefined) {
      runner.interactor.controller.stop();
    }
    const slot = await load(saveSlot);
    runner = new Runner(onTicked, slot);
  },
  // game controls
  start() {
    runner.interactor.controller.start();
  },
  stop() {
    runner.interactor.controller.stop();
  },
  // store
  async save() {
    await runner.interactor.store.save();
  },
  // bonfire
  buildItem(id: BonfireItemId) {
    runner.interactor.bonfire.buildItem(id);
  },
  // society
  assignJob(id: JobId) {
    runner.interactor.society.assignJob(id);
  },
  unassignJob(id: JobId) {
    runner.interactor.society.unassignJob(id);
  },
  // science
  researchTechnology(id: TechnologyId) {
    runner.interactor.science.researchTechnology(id);
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
