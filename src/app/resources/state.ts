import { IEntityState } from "../core/entity-types";
import { ResourceId as Id } from "./metadata";

export class State implements IEntityState<Id> {
  id: Id = "catnip";
  unlocked = false;
  amount = 0;
  capacity?: number;
}

// entity defaults

const defaultState = new State();

const SpecialDefaultStates: Partial<Record<Id, State>> = {};

export function getDefaultState(id: Id): State {
  return SpecialDefaultStates[id] ?? defaultState;
}

export { State as ResourceState };
