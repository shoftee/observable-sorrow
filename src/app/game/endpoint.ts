import { BonfireItemId } from "@/_interfaces";

import { EntityId } from "../entity";

export type PropertyBag = Record<string, unknown>;
export type ChangesBag = {
  added: Map<EntityId, PropertyBag>;
  updated: Map<EntityId, PropertyBag>;
  removed: Set<EntityId>;
};

export type OnTickedHandler = (changes: ChangesBag) => void;
export type InitializeOptions = {
  onTicked: OnTickedHandler;
};

export interface IPresenterChangeSink {
  update(changes: ChangesBag): void;
}

export interface IRootInteractor {
  initialize(options: InitializeOptions): void;
  start(): void;
  stop(): void;
  buildItem(id: BonfireItemId): void;
}

export interface IBonfireInteractor {
  buildItem(id: BonfireItemId): void;
}

export interface IGameController {
  start(): void;
  stop(): void;
}
