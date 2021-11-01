import { reactive } from "vue";

import { FulfillmentId } from "@/app/interfaces";
import {
  FulfillmentState,
  ingredientsFromObject,
  Meta,
  ResourcesType,
} from "@/app/state";

import { Entity, EntityPool, Watched, Watcher } from ".";

export class FulfillmentEntity
  extends Entity<FulfillmentId>
  implements Watched
{
  readonly state: FulfillmentState;

  constructor(id: FulfillmentId, ingredients: ResourcesType) {
    super(id);

    this.state = reactive<FulfillmentState>({
      ingredients: ingredientsFromObject(ingredients),
      capped: false,
      fulfilled: false,
    });
  }

  watch(watcher: Watcher): void {
    watcher.watch(this.id, this.state);
  }
}

export class FulfillmentsPool extends EntityPool<
  FulfillmentId,
  FulfillmentEntity
> {
  constructor(watcher: Watcher) {
    super("fulfillments", watcher);
    for (const meta of Meta.buildings()) {
      this.add(new FulfillmentEntity(meta.id, meta.prices.base));
    }
    for (const meta of Meta.recipes()) {
      this.add(new FulfillmentEntity(meta.id, meta.ingredients));
    }
    for (const meta of Meta.techs()) {
      this.add(new FulfillmentEntity(meta.id, meta.ingredients));
    }
  }
}
