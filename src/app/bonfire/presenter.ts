import { Ref, ref, unref } from "vue";

import {
  BonfireItemId,
  BonfireMetadata,
  BonfireMetadataType,
} from "../core/metadata/bonfire";
import { BuildingMetadata } from "../core/metadata/buildings";
import { WorkshopRecipeMetadata } from "../core/metadata/crafting";
import { ResourceQuantityType } from "../core/metadata/recipes";
import { ResourceId, ResourceMetadata } from "../core/metadata/resources";

import { IRender } from "../ecs";
import { ResourcePool } from "../resources";

export interface IBonfirePresenter extends IRender {
  readonly items: Ref<BonfireItem[]>;
}

export class BonfirePresenter implements IBonfirePresenter {
  readonly items: Ref<BonfireItem[]>;

  constructor(private readonly resources: ResourcePool) {
    const items = Object.values(BonfireMetadata).map((e) =>
      this.newBonfireItem(e),
    );

    this.items = ref(items) as Ref<BonfireItem[]>;
  }

  render(): void {
    for (const recipe of unref(this.items)) {
      for (const ingredient of recipe.ingredients) {
        const resource = this.resources.get(ingredient.id);
        ingredient.fulfillment = resource.amount.value;
      }
    }
  }

  private newBonfireItem(item: BonfireMetadataType): BonfireItem {
    const result: BonfireItem = new BonfireItem(item);
    switch (item.intent.kind) {
      case "gather-catnip":
        result.unlocked = true;
        return result;

      case "refine-catnip":
        result.unlocked = true;
        result.ingredients = this.newRecipeList(
          WorkshopRecipeMetadata[item.intent.recipeId].ingredients,
        );
        return result;

      case "buy-building":
        result.ingredients = this.newRecipeList(
          BuildingMetadata[item.intent.buildingId].ingredients,
        );
        return result;
    }
  }

  private newRecipeList(
    ingredients: ResourceQuantityType[],
  ): RecipeIngredientItem[] {
    return ingredients.map(
      (ingredient) =>
        new RecipeIngredientItem(
          ingredient.id,
          ResourceMetadata[ingredient.id].label,
          ingredient.amount,
        ),
    );
  }
}

class BonfireItem {
  id: BonfireItemId;
  label: string;
  description: string;
  flavor?: string;
  unlocked = false;
  ingredients: RecipeIngredientItem[] = [];

  constructor(metadata: BonfireMetadataType) {
    this.id = metadata.id;
    this.label = metadata.label;
    this.description = metadata.description;
    this.flavor = metadata.flavor;
  }

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
