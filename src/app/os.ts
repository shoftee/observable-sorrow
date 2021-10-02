import { wrap } from "comlink";

import { IRootInteractor } from "@/_interfaces";

import { PresenterFacade, Updater } from "./presenters";

const worker = new Worker(new URL("./game/worker.ts", import.meta.url));
export const Interactor = wrap<IRootInteractor>(worker);
export const Presenters = new PresenterFacade(new Updater());
