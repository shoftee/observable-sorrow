import { Ref } from "vue";
import { IResourceState } from "../components/resource";
import { ResourceId } from "../resources/metadata";

interface IResourceManager {
  getState(id: ResourceId): Ref<IResourceState>;
  allStates(): Ref<IResourceState>[];
}

export { IResourceManager };
