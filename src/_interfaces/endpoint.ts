import { EntityId } from "@/app/entity";
import { BonfireItemId } from "./id";

export type PropertyBag = Record<string, unknown> | undefined;
export type OnTickedHandler = (changes: Map<EntityId, PropertyBag>) => void;
export type InitializeOptions = {
  onTicked: OnTickedHandler;
};

export interface IPresenterChangeSink {
  update(changes: Map<EntityId, PropertyBag>): void;
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
