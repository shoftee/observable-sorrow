import { Ref } from "vue";
import { ILimitState } from "../components/limit";
import { ResourceId } from "../resources/metadata";

interface ILimitsManager {
  getState(id: ResourceId): Ref<ILimitState>;
  allStates(): Ref<ILimitState>[];
}

export { ILimitsManager };
