import { Ref } from "vue";
import { ReactiveStateMap } from "../core/entity-state-map";
import { ResourceId as Id } from "../resources/metadata";
import { newResource, IResourceState as IState } from "../components/resource";
import { IGame } from "../systems/game";
import { IResourceManager } from "../systems/resources";

class Manager implements IResourceManager {
  private states = new ReactiveStateMap<Id, IState>(
    Array.of(newResource("catnip")),
  );

  register(_game: IGame): void {
    //
  }

  getState(id: Id): Ref<IState> {
    return this.states.get(id);
  }

  allStates(): Ref<IState>[] {
    return this.states.all();
  }

  update(_deltaTime: number): void {
    //
  }
}

export { Manager as ResourceManager };
