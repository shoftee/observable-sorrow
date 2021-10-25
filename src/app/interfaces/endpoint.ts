import { BonfireItemId, JobId, PoolId, TechId } from ".";

export type PropertyBag = Record<string, unknown>;

export type ChangePool = {
  poolId: PoolId;
  added?: Map<string, PropertyBag>;
  updated?: Map<string, PropertyBag>;
  removed?: Set<string>;
};

export type OnTickedHandler = (changes: Iterable<ChangePool>) => void;

export interface IPresenterChangeSink {
  update(changes: Iterable<ChangePool>): void;
}

export interface IRootInteractor
  extends IBonfireInteractor,
    IDevToolsInteractor,
    IGameController,
    IScienceInteractor,
    ISocietyInteractor,
    IStoreInteractor {
  initialize(
    onTicked: OnTickedHandler,
    saveSlot: number | undefined,
  ): Promise<void>;
}

export interface IBonfireInteractor {
  buildItem(id: BonfireItemId): void;
}

export interface IScienceInteractor {
  researchTech(id: TechId): void;
}

export interface ISocietyInteractor {
  assignJob(id: JobId): void;
  unassignJob(id: JobId): void;
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
