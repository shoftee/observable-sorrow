import { asEnumerable } from "linq-es2015";
import { ComputedRef, Ref, toRefs, ToRefs, unref } from "vue";
import { ISystem } from "../ecs";

import { AmountState } from "../resources/entity";
import { ResourceId } from "../resources/metadata";
import { ResourcePool } from "../resources/pool";

export class ResourceListSystem implements ISystem {
  readonly type = "resource-list";

  constructor(readonly pool: ResourcePool) {}

  get(id: ResourceId): ToRefs<ResourceListItem> {
    const entity = this.pool.get(id)!;
    const amountRef = entity.getAmount();
    return constructRef<AmountState>(amountRef);
  }
}

type ResourceListItem = AmountState;

function constructRef<T extends object>(state: Ref<T>): ToRefs<T> {
  return toRefs(unref(state)) as ToRefs<T>;
}
