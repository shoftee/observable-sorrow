import { ResourceId as Id } from "../_metadata/resources";

interface IState {
  readonly id: Id;
  unlocked: boolean;
  amount: number;
  capacity?: number;
}

// entity defaults
const SpecialDefaultStates: Partial<Record<Id, IState>> = {};

function newResource(id: Id): IState {
  return (
    SpecialDefaultStates[id] ?? {
      id: id,
      unlocked: false,
      amount: 0,
    }
  );
}

export { IState as IResourceState, newResource };
