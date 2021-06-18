import { Ref } from "vue";
import { IEnvironmentState } from "../entities/environment";
import { IEnvironmentMetadata } from "../_metadata/environment";

interface IEnvironmentManager {
  getState(): Ref<IEnvironmentState>;
  getMeta(): IEnvironmentMetadata;
}

export { IEnvironmentManager };
