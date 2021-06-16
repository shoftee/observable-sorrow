import { Ref } from "@vue/runtime-core";
import { ReactiveStateMap, ReadonlyStateMap } from "../core/entity-state-map";
import {
  ResourceId as Id,
  IResourceMetadata as IMetadata,
  Metadata,
} from "./metadata";
import { State } from "./state";
import { ChangeAmountMutation } from "./mutations";
import { IMutationSink } from "../core/mutation";
import { BaseManager } from "../core/_types";

class ResourceManager extends BaseManager {
  private states: ReactiveStateMap<Id, State>;
  private readonly: ReadonlyStateMap<Id, State>;

  constructor(mutationSink: IMutationSink) {
    super(mutationSink);

    this.states = new ReactiveStateMap(Array.of(new State()));
    this.readonly = this.states.readonly();
  }

  getMeta(id: Id): IMetadata {
    return Metadata[id];
  }

  allMetas(): Iterable<IMetadata> {
    return Object.values(Metadata);
  }

  getState(id: Id): Ref<State> {
    return this.readonly.get(id);
  }

  allStates(): Ref<State>[] {
    return this.readonly.all();
  }

  gatherCatnip(): void {
    const mutation = new ChangeAmountMutation(this.states.get("catnip"), +1);
    this.mutationSink.send(mutation);
  }
}

export { ResourceManager };
