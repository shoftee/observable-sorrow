import { Ref } from "@vue/runtime-core";
import { ReactiveStateMap } from "../core/entity-state-map";
import { IGame, IRegisterInGame } from "../game/game";
import {
  ResourceId as Id,
  IResourceMetadata as IMetadata,
  Metadata,
} from "./metadata";
import { ResourceState as State } from "./state";

class ResourceManager {
  private states = new ReactiveStateMap<Id, State>(Array.of(new State()));

  getMeta(id: Id): IMetadata {
    return Metadata[id];
  }

  allMetas(): Iterable<IMetadata> {
    return Object.values(Metadata);
  }

  getState(id: Id): Ref<State> {
    return this.states.get(id);
  }

  allStates(): Ref<State>[] {
    return this.states.all();
  }
}

export default ResourceManager;
