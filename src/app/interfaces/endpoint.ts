import { EventId, Intent, PoolId } from ".";

export type PropertyBag = Record<string, unknown>;

export type MutationPool = {
  poolId: PoolId;
  added?: Map<string, PropertyBag>;
  updated?: Map<string, PropertyBag>;
  removed?: Set<string>;
};

export type EventPool = { id: EventId; events: PropertyBag[] };

export type OnMutationHandler = (mutations: MutationPool[]) => void;
export type OnEventHandler = (events: EventPool[]) => void;

export interface IPresenterChangeSink {
  acceptMutations(changes: MutationPool[]): void;
  acceptEvents(events: EventPool[]): void;
}

export interface IRootInteractor
  extends IDispatcher,
    IDevToolsInteractor,
    IGameController,
    IStoreInteractor {
  initialize(
    onTicked: OnMutationHandler,
    onLogEvent: OnEventHandler,
    saveSlot: number | undefined,
  ): Promise<void>;
}

export interface IDispatcher {
  send(intent: Intent): Promise<void>;
}

export interface IStoreInteractor {
  save(): Promise<void>;
}

export interface IDevToolsInteractor {
  turnDevToolsOn(): void;
  turnDevToolsOff(): void;
  setGatherCatnip(amount: number): void;
  setTimeAcceleration(factor: number): void;
}

export interface IGameController {
  start(): void;
  stop(): void;
}
