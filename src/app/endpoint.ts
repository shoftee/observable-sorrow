import { proxy, releaseProxy, RemoteObject, wrap } from "comlink";

import {
  IDispatcher,
  IDevToolsInteractor,
  IGameController,
  IRootInteractor,
  IStoreInteractor,
  OnEventHandler,
  OnMutationHandler,
} from "@/app/interfaces";

import {
  BonfirePresenter,
  EnvironmentPresenter,
  NumberFormatter,
  PlayerPresenter,
  PresenterFacade,
  ResourcesPresenter,
  SciencePresenter,
  SectionsPresenter,
  SocietyPresenter,
  StateManager,
} from "./presenters";

export type Endpoint = {
  interactors: {
    controller: RemoteObject<IGameController>;
    devTools: RemoteObject<IDevToolsInteractor>;
    dispatcher: RemoteObject<IDispatcher>;
    store: RemoteObject<IStoreInteractor>;
  };
  presenters: {
    bonfire: BonfirePresenter;
    formatter: NumberFormatter;
    environment: EnvironmentPresenter;
    player: PlayerPresenter;
    resources: ResourcesPresenter;
    science: SciencePresenter;
    section: SectionsPresenter;
    society: SocietyPresenter;
  };
};

let release: () => void;

export async function Setup(): Promise<Endpoint> {
  // release old proxies if they're around
  release?.();

  const worker = new Worker(new URL("./game/worker.ts", import.meta.url));
  const root = wrap<IRootInteractor>(worker);

  const stateManager = new StateManager();
  const onTicked: OnMutationHandler = proxy(function (changes) {
    stateManager.acceptMutations(changes);
  });
  const onLogEvent: OnEventHandler = function (logEvents) {
    stateManager.acceptEvents(logEvents);
  };

  await root.initialize(proxy(onTicked), proxy(onLogEvent));
  await root.load();

  release = () => {
    root[releaseProxy]();
  };

  const presenters = new PresenterFacade(stateManager);

  return {
    presenters: {
      bonfire: presenters.bonfire,
      environment: presenters.environment,
      formatter: presenters.formatter,
      player: presenters.player,
      resources: presenters.resources,
      science: presenters.science,
      section: presenters.sections,
      society: presenters.society,
    },
    interactors: {
      controller: {
        start: root.start,
        stop: root.stop,
      },
      devTools: {
        turnDevToolsOn: root.turnDevToolsOn,
        turnDevToolsOff: root.turnDevToolsOff,
        setGatherCatnip: root.setGatherCatnip,
        setTimeAcceleration: root.setTimeAcceleration,
      },
      dispatcher: {
        send: root.send,
      },
      store: {
        load: root.load,
        save: root.save,
      },
    },
  };
}
