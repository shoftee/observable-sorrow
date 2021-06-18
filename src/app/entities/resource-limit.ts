import { LimitMetadata } from "../_metadata/limits";
import { ResourceId } from "../_metadata/resources";

interface IState {
  readonly id: ResourceId;
  value: number;
}

function newLimit(id: ResourceId): IState {
  return {
    id: id,
    value: LimitMetadata[id].base,
  };
}

export { IState as ILimitState, newLimit };
