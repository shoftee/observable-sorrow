import { reactive } from "vue";

import { RecipeId } from "@/app/interfaces";
import {
  Meta,
  RecipeMetadataType,
  RecipeState,
  ResourceMap,
} from "@/app/state";

import { Entity, EntityPool, OrderStatus, Watched, Watcher } from ".";

export class RecipeEntity extends Entity<RecipeId> implements Watched {
  readonly state: RecipeState;

  status: OrderStatus;

  constructor(readonly meta: RecipeMetadataType) {
    super(meta.id);
    this.state = reactive<RecipeState>({
      products: ResourceMap.fromObject(meta.products),
    });

    this.status = OrderStatus.EMPTY;
  }

  watch(watcher: Watcher): void {
    watcher.watch(this.id, this.state);
  }
}

export class RecipesPool extends EntityPool<RecipeId, RecipeEntity> {
  constructor(watcher: Watcher) {
    super("recipes", watcher);
    for (const meta of Meta.recipes()) {
      this.add(new RecipeEntity(meta));
    }
  }
}
