import { IEntityState } from "../core/entity";
import { Id } from "./types";

export class State implements IEntityState<Id> {
  id: Id = "catnip"
  unlocked = false;
  amount = 0;
  capacity?: number = 10;

  changeAmount(difference: number): number {
    const currentValue = this.amount;
    
    let newValue = currentValue + difference;
    if (this.capacity) {
      newValue = Math.min(newValue, this.capacity);
    }

    return newValue - currentValue;
  }
}

// entity defaults

const defaultState = new State();

const SpecialDefaultStates: Partial<Record<Id, State>> = {};

export function GetDefaults(id: Id): State {
  return SpecialDefaultStates[id] ?? defaultState;
}
