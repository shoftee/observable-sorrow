import { proxy, RemoteObject, wrap } from "comlink";

import {
  IBonfireInteractor,
  IDevToolsInteractor,
  IGameController,
  IRootInteractor,
  IScienceInteractor,
  ISocietyInteractor,
  IStoreInteractor,
  OnTickedHandler,
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
import { loadOrInitGeneral } from "./store/db";

const worker = new Worker(new URL("./game/worker.ts", import.meta.url));
const root = wrap<IRootInteractor>(worker);

export type Channel = {
  interactors: {
    bonfire: RemoteObject<IBonfireInteractor>;
    controller: RemoteObject<IGameController>;
    devTools: RemoteObject<IDevToolsInteractor>;
    society: RemoteObject<ISocietyInteractor>;
    science: RemoteObject<IScienceInteractor>;
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

export async function Setup(): Promise<Channel> {
  const stateManager = new StateManager();
  const handler: OnTickedHandler = function (changes) {
    stateManager.update(changes);
  };

  const general = await loadOrInitGeneral();
  await root.initialize(proxy(handler), general.currentSlot);

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
      bonfire: {
        buildItem: root.buildItem,
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
      society: {
        assignJob: root.assignJob,
        unassignJob: root.unassignJob,
      },
      science: {
        researchTechnology: root.researchTechnology,
      },
      store: {
        save: root.save,
      },
    },
  };
}
