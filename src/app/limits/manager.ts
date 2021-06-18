import { LimitMetadata } from "@/app/_metadata/limits";

import { ReactiveStateMap } from "@/app/core/entity-state-map";
import { Ref } from "@vue/reactivity";
import { ILimitState as IState, newLimit } from "../entities/resource-limit";
import { asEnumerable } from "linq-es2015";
import { ResourceId } from "@/app/_metadata/resources";

class Manager {
  private readonly states = new ReactiveStateMap<ResourceId, IState>(
    asEnumerable(Object.keys(LimitMetadata) as ResourceId[]).Select((id) =>
      newLimit(id),
    ),
  );

  getState(id: ResourceId): Ref<IState> {
    return this.states.get(id);
  }

  allStates(): Ref<IState>[] {
    return this.states.all();
  }
}

export { Manager as LimitsManager };
