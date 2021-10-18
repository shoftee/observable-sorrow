import { proxy, RemoteObject, wrap } from "comlink";

import {
  IBonfireInteractor,
  IDevToolsInteractor,
  IGameController,
  IRootInteractor,
  ISocietyInteractor,
  OnTickedHandler,
} from "./game/endpoint";

import {
  BonfirePresenter,
  EnvironmentPresenter,
  NumberFormatter,
  PlayerPresenter,
  PresenterFacade,
  ResourcesPresenter,
  SectionsPresenter,
  SocietyPresenter,
  StateManager,
} from "./presenters";

const worker = new Worker(new URL("./game/worker.ts", import.meta.url));
const root = wrap<IRootInteractor>(worker);

export type Channel = {
  interactors: {
    bonfire: RemoteObject<IBonfireInteractor>;
    controller: RemoteObject<IGameController>;
    devTools: RemoteObject<IDevToolsInteractor>;
    society: RemoteObject<ISocietyInteractor>;
  };
  presenters: {
    bonfire: BonfirePresenter;
    formatter: NumberFormatter;
    environment: EnvironmentPresenter;
    player: PlayerPresenter;
    resources: ResourcesPresenter;
    section: SectionsPresenter;
    society: SocietyPresenter;
  };
};

const stateManager = new StateManager();

export async function Setup(): Promise<Channel> {
  const handler: OnTickedHandler = function (changes) {
    stateManager.update(changes);
  };
  await root.initialize(proxy({ onTicked: handler }));

  const presenters = new PresenterFacade(stateManager);

  return {
    presenters: {
      bonfire: presenters.bonfire,
      environment: presenters.environment,
      formatter: presenters.formatter,
      player: presenters.player,
      resources: presenters.resources,
      section: presenters.sections,
      society: presenters.society,
    },
    interactors: {
      bonfire: {
        buildItem: root.buildItem,
      },
      society: {
        assignJob: root.assignJob,
        unassignJob: root.unassignJob,
      },
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
    },
  };
}
