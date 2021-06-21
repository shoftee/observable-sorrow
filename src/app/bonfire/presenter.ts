import { asEnumerable } from "linq-es2015";
import { Ref, ref, unref } from "vue";

import { IRender } from "../ecs";
import { RecipeId, RecipeMetadataType, RecipeMetadata } from "../workshop";
import {
  ResourceId,
  ResourceMetadata,
  ResourceMetadataType,
  ResourcePool,
} from "../resources";
import {
  BonfireItemId,
  BonfireMetadata,
  BonfireMetadataType,
} from "./metadata";

export interface IBonfirePresenter extends IRender {
  readonly items: Ref<Map<BonfireItemId, BonfireItem>>;
}

export class BonfirePresenter implements IBonfirePresenter {
  private readonly bonfireMetadata: Record<BonfireItemId, BonfireMetadataType>;
  private readonly recipeMetadata: Record<RecipeId, RecipeMetadataType>;
  private readonly resourceMetadata: Record<ResourceId, ResourceMetadataType>;

  readonly items: Ref<Map<BonfireItemId, BonfireItem>>;

  constructor(private readonly resources: ResourcePool) {
    this.bonfireMetadata = BonfireMetadata;
    this.recipeMetadata = RecipeMetadata;
    this.resourceMetadata = ResourceMetadata;
    const items = asEnumerable(Object.values(this.bonfireMetadata)).ToMap(
      (e) => e.id,
      (e) => this.newBonfireItem(e),
    );

    this.items = ref(items) as Ref<Map<BonfireItemId, BonfireItem>>;
  }

  render(): void {
    const vm = unref(this.items);

    for (const recipe of vm.values()) {
      for (const ingredient of recipe.ingredients) {
        const resource = this.resources.get(ingredient.id);
        ingredient.fulfillment = resource.amount.value;
      }
    }
  }

  private newBonfireItem(bonfire: BonfireMetadataType): BonfireItem {
    return new BonfireItem(
      bonfire.id,
      bonfire.label,
      bonfire.desc,
      true,
      this.recipeMetadata[bonfire.id].ingredients.map(
        (ingredient) =>
          new RecipeIngredientItem(
            ingredient.id,
            this.resourceMetadata[ingredient.id].label,
            ingredient.amount,
          ),
      ),
    );
  }
}

class BonfireItem {
  constructor(
    public id: RecipeId,
    public label: string,
    public description: string,
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
    public label: string,
    public requirement: number,
    public fulfillment: number = 0,
  ) {}

  get fulfilled(): boolean {
    return this.fulfillment >= this.requirement;
  }
}
