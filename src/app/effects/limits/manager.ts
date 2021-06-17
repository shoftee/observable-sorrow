import { ReactiveStateMap } from "@/app/core/entity-state-map";
import { Ref } from "@vue/reactivity";
import {
  ILimitMetadata as IMetadata,
  LimitId as Id,
  Metadata,
} from "../../_metadata/resource-limits";
import { ILimitState as IState, newLimit } from "../../entities/resource-limit";
import { asEnumerable } from "linq-es2015";

class Manager {
  private readonly states = new ReactiveStateMap<Id, IState>(
    asEnumerable(Object.keys(Metadata) as Id[]).Select((id) => newLimit(id)),
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

export default Manager;
