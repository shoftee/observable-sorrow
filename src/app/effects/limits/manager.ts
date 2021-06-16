import { ReactiveStateMap } from "@/app/core/entity-state-map";
import { IMutationSink } from "@/app/core/mutation";
import { BaseManager } from "@/app/core/_types";
import { Ref } from "@vue/reactivity";
import {
  ILimitMetadata as IMetadata,
  LimitedResourceId as Id,
  Metadata,
} from "./metadata";
import { LimitState } from "./state";

class LimitsManager extends BaseManager {
  readonly states: ReactiveStateMap<Id, LimitState>;

  constructor(mutationSink: IMutationSink) {
    super(mutationSink);

    const states = Array.of(new LimitState("catnip"));
    this.states = new ReactiveStateMap<Id, LimitState>(states);
  }

  getMeta(id: Id): IMetadata {
    return Metadata[id];
  }

  allMetas(): Iterable<IMetadata> {
    return Object.values(Metadata);
  }

  getState(id: Id): Ref<LimitState> {
    return this.states.get(id);
  }

  allStates(): Ref<LimitState>[] {
    return this.states.all();
  }
}

export { LimitsManager };
