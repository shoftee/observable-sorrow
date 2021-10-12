import { reactive } from "vue";

import { RecipeId } from "@/_interfaces";
import { Meta, RecipeState } from "@/_state";

import { Entity, EntityPool, EntityWatcher, OrderStatus, Watch } from ".";

export class RecipeEntity extends Entity {
  readonly state: RecipeState;

  status: OrderStatus;

  constructor(readonly id: RecipeId) {
    super(id);
    this.state = reactive(new RecipeState(id));

    this.status = OrderStatus.EMPTY;
  }

  acceptWatcher(watcher: Watch): void {
    watcher(this.id, this.state);
  }
}

export class RecipesPool extends EntityPool<RecipeId, RecipeEntity> {
  constructor(watcher: EntityWatcher) {
    super("recipes", watcher);
    for (const { id } of Meta.recipes()) {
      this.add(new RecipeEntity(id));
    }
  }
}
