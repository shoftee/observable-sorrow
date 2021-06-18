import { Ref } from "vue";
import { ReactiveStateMap } from "../core/entity-state-map";
import {
  ResourceId as Id,
  IResourceMetadata as IMetadata,
  Metadata,
} from "../_metadata/resources";
import { newResource, IResourceState as IState } from "../entities/resource";

class ResourceManager {
  private states = new ReactiveStateMap<Id, IState>(
    Array.of(newResource("catnip")),
  );

  getMeta(id: Id): IMetadata {
    return Metadata[id];
  }

  allMetas(): Iterable<IMetadata> {
    return Object.values(Metadata);
  }

  getState(id: Id): Ref<IState> {
    return this.states.get(id);
  }

  allStates(): Ref<IState>[] {
    return this.states.all();
  }
}

export default ResourceManager;
