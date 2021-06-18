import { Ref } from "vue";
import { IResourceState } from "../entities/resource";
import { ResourceId } from "../_metadata/resources";

interface IResourceManager {
  getState(id: ResourceId): Ref<IResourceState>;
  allStates(): Ref<IResourceState>[];
}

export { IResourceManager };
