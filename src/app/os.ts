import { proxy, RemoteObject, wrap } from "comlink";

import {
  IBonfireInteractor,
  IGameController,
  IRootInteractor,
  OnTickedHandler,
} from "@/_interfaces";

import {
  BonfirePresenter,
  EnvironmentPresenter,
  NumberFormatter,
  PresenterFacade,
  ResourcesPresenter,
  StateManager,
} from "./presenters";

const worker = new Worker(new URL("./game/worker.ts", import.meta.url));
const root = wrap<IRootInteractor>(worker);

export type Channel = Readonly<{
  interactors: {
    controller: RemoteObject<IGameController>;
    bonfire: RemoteObject<IBonfireInteractor>;
  };
  presenters: {
    bonfire: BonfirePresenter;
    resources: ResourcesPresenter;
    environment: EnvironmentPresenter;
    formatter: NumberFormatter;
  };
}>;

const stateManager = new StateManager();

export async function Setup(): Promise<Channel> {
  const handler: OnTickedHandler = function (changes) {
    stateManager.update(changes);
  };
  await root.initialize(
    proxy({
      onTicked: handler,
    }),
  );

  const presenters = new PresenterFacade(stateManager);

  return {
    presenters: {
      bonfire: presenters.bonfire,
      environment: presenters.environment,
      formatter: presenters.formatter,
      resources: presenters.resources,
    },
    interactors: {
      bonfire: {
        buildItem: root.buildItem,
      },
      controller: {
        start: root.start,
        stop: root.stop,
      },
    },
  };
}
