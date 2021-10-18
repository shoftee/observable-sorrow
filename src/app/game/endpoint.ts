import { BonfireItemId, JobId } from "@/_interfaces";

import { EntityId, PoolEntityId } from "../entity";

export type PropertyBag = Record<string, unknown>;

export type ChangePool = {
  poolId?: PoolEntityId;
  added?: Map<EntityId, PropertyBag>;
  updated?: Map<EntityId, PropertyBag>;
  removed?: Set<EntityId>;
};

export type OnTickedHandler = (changes: Iterable<ChangePool>) => void;
export type InitializeOptions = {
  onTicked: OnTickedHandler;
};

export interface IPresenterChangeSink {
  update(changes: Iterable<ChangePool>): void;
}

export interface IRootInteractor
  extends IBonfireInteractor,
    IDevToolsInteractor,
    IGameController,
    ISocietyInteractor {
  initialize(options: InitializeOptions): void;
}

export interface IBonfireInteractor {
  buildItem(id: BonfireItemId): void;
}

export interface ISocietyInteractor {
  assignJob(id: JobId): void;
  unassignJob(id: JobId): void;
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
