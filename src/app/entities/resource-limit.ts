import { LimitId, Metadata } from "../_metadata/resource-limits";

type Id = LimitId;

interface IState {
  readonly id: Id;
  value: number;
}

function newLimit(id: Id): IState {
  return {
    id: id,
    value: Metadata[id].base,
  };
}

export { IState as ILimitState, newLimit };
