import { Ref } from "vue";
import { ILimitState } from "../entities/resource-limit";
import { ResourceId } from "../_metadata/resources";

interface ILimitsManager {
  getState(id: ResourceId): Ref<ILimitState>;
  allStates(): Ref<ILimitState>[];
}

export { ILimitsManager };
