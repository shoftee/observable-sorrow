import { proxy, releaseProxy, wrap } from "comlink";

import { Intent, IRootInteractor, OnRenderHandler } from "@/app/interfaces";

import {
  BonfirePresenter,
  IStateManager,
  NumberFormatter,
  PlayerPresenter,
  PresenterFacade,
  SciencePresenter,
  SocietyPresenter,
  StateManager,
} from "./presenters";
import { ComponentDeltas } from "./game/systems2/types";

export type Endpoint = {
  send(intent: Intent): Promise<void>;
  stateManager: IStateManager;
  presenters: {
    bonfire: BonfirePresenter;
    formatter: NumberFormatter;
    player: PlayerPresenter;
    science: SciencePresenter;
    society: SocietyPresenter;
  };
};

let release: () => Promise<void>;

export async function Setup(): Promise<Endpoint> {
  // release old proxies if they're around
  await release?.();

  const worker = new Worker(new URL("./game/worker.ts", import.meta.url));
  const root = wrap<IRootInteractor>(worker);

  const stateManager = new StateManager();
  const onRender: OnRenderHandler = proxy(function (deltas: ComponentDeltas) {
    stateManager.acceptRender(deltas);
  });

  await root.initialize(proxy(onRender));
  await root.start();

  release = async () => {
    await root.stop();
    root[releaseProxy]();
  };

  return {
    async send(intent: Intent): Promise<void> {
      await root.send(intent);
    },
    stateManager: stateManager,
    presenters: new PresenterFacade(stateManager),
  };
}
