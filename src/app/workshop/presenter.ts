import { asEnumerable } from "linq-es2015";
import { Ref, ref, unref } from "vue";

import { IRender } from "../ecs";
import { RecipeId, RecipeMetadataType, RecipeMetadata } from ".";
import { ResourceId, ResourcePool } from "../resources";

export interface IWorkshopPresenter extends IRender {
  readonly recipes: Ref<Map<RecipeId, RecipeItem>>;
}

export class WorkshopPresenter {
  private readonly metadata: Record<RecipeId, RecipeMetadataType>;

  readonly recipes: Ref<Map<RecipeId, RecipeItem>>;

  constructor(private readonly resources: ResourcePool) {
    this.metadata = RecipeMetadata;
    const items = asEnumerable(Object.values(this.metadata)).ToMap(
      (e) => e.id,
      (e) => this.newRecipeItem(e),
    );

    this.recipes = ref(items) as Ref<Map<RecipeId, RecipeItem>>;
  }

  render(): void {
    const vm = unref(this.recipes);

    for (const recipe of vm.values()) {
      for (const ingredient of recipe.ingredients) {
        const resource = this.resources.get(ingredient.id);
        ingredient.fulfillment = resource.amount.value;
      }
    }
  }

  private newRecipeItem(metadata: RecipeMetadataType): RecipeItem {
    return new RecipeItem(
      metadata.id,
      true,
      metadata.ingredients.map(
        (ingredient) =>
          new RecipeIngredientItem(ingredient.id, ingredient.amount, 0),
      ),
    );
  }
}

class RecipeItem {
  constructor(
    public id: RecipeId,
    public unlocked: boolean,
    public ingredients: RecipeIngredientItem[],
  ) {}

  get fulfilled(): boolean {
    for (const ingredient of this.ingredients) {
      if (!ingredient.fulfilled) {
        return false;
      }
    }
    return true;
  }
}

class RecipeIngredientItem {
  constructor(
    public id: ResourceId,
    public requirement: number,
    public fulfillment: number,
  ) {}

  get fulfilled(): boolean {
    return this.fulfillment >= this.requirement;
  }
}
