import { ComponentDeltas } from "@/app/game/systems2/types";

import { EventId, Intent, PoolId } from ".";

export type PropertyBag = Record<string, unknown>;

export type MutationPool = {
  poolId: PoolId;
  added?: Map<string, PropertyBag>;
  updated?: Map<string, PropertyBag>;
  removed?: Set<string>;
};

export type EventPool = { id: EventId; events: PropertyBag[] };

export type OnRenderHandler = (deltas: ComponentDeltas) => void;
export type OnMutationHandler = (mutations: MutationPool[]) => void;
export type OnEventHandler = (events: EventPool[]) => void;

export interface IPresenterChangeSink {
  acceptRender(deltas: ComponentDeltas): void;
  acceptMutations(changes: MutationPool[]): void;
  acceptEvents(events: EventPool[]): void;
}

export interface IRootInteractor extends IDispatcher, IGameController {
  initialize(onRender: OnRenderHandler): void;
}

export interface IDispatcher {
  send(intent: Intent): void;
}

export interface IGameController {
  start(): void;
  stop(): void;
}
