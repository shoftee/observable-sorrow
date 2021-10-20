import { reactive } from "vue";

import { RecipeId } from "@/app/interfaces";
import {
  ingredientsFromObject,
  Meta,
  RecipeMetadataType,
  RecipeState,
  ResourceMap,
} from "@/app/state";

import { Entity, EntityPool, OrderStatus, Watcher } from ".";

export class RecipeEntity extends Entity<RecipeId> {
  readonly state: RecipeState;

  status: OrderStatus;

  constructor(readonly meta: RecipeMetadataType) {
    super(meta.id);
    this.state = reactive({
      ingredients: ingredientsFromObject(meta.ingredients),
      products: ResourceMap.fromObject(meta.products),
      capped: false,
      fulfilled: false,
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
