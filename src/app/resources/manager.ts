import { Ref, unref } from "vue";
import { ReactiveStateMap } from "../core/entity-state-map";
import { ResourceId as Id } from "../_metadata/resources";
import { newResource, IResourceState as IState } from "../entities/resource";
import { IGame, IUpdated } from "../systems/game";
import { MetadataPool } from "../_metadata/pool";
import { IResourceManager } from "../systems/resources";

class Manager implements IResourceManager, IUpdated {
  private states = new ReactiveStateMap<Id, IState>(
    Array.of(newResource("catnip")),
  );
  private metadata!: MetadataPool;

  register(game: IGame): void {
    this.metadata = game.metadata;
  }

  getState(id: Id): Ref<IState> {
    return this.states.get(id);
  }

  allStates(): Ref<IState>[] {
    return this.states.all();
  }

  // eslint-disable-next-line
  update(_tick: number): void {
    for (const state of this.states.all()) {
      const resource = unref(state);
      const limit = this.metadata.limits[resource.id];
      if (limit !== undefined) {
        resource.capacity = limit.base;
      }
    }
  }
}

export { Manager as ResourceManager };
