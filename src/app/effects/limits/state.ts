import { IEntityState } from "@/app/core/entity-types";

import { LimitedResourceId, Metadata } from "./metadata";

type Id = LimitedResourceId;

class State implements IEntityState<Id> {
  readonly id: Id;
  value: number;

  constructor(id: Id, value?: number) {
    this.id = id;
    this.value = value ?? Metadata[id].base;
  }
}

export { State as LimitState };
