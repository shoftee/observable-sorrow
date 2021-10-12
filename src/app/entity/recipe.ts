import { reactive } from "vue";

import { RecipeId } from "@/_interfaces";
import { Meta, RecipeMetadataType, RecipeState } from "@/_state";

import { Entity, EntityPool, EntityWatcher, OrderStatus, Watch } from ".";

export class RecipeEntity extends Entity<RecipeId> {
  readonly state: RecipeState;

  status: OrderStatus;

  constructor(readonly meta: RecipeMetadataType) {
    super(meta.id);
    this.state = reactive(new RecipeState(meta));

    this.status = OrderStatus.EMPTY;
  }

  acceptWatcher(watcher: Watch): void {
    watcher(this.id, this.state);
  }
}

export class RecipesPool extends EntityPool<RecipeId, RecipeEntity> {
  constructor(watcher: EntityWatcher) {
    super("recipes", watcher);
    for (const meta of Meta.recipes()) {
      this.add(new RecipeEntity(meta));
    }
  }
}
