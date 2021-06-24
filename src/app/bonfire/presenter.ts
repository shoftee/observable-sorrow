import { Ref, ref, unref } from "vue";

import { IRender } from "../ecs";

import { BuildingEntity } from "../buildings";
import {
  BonfireItemId,
  BonfireMetadata,
  BonfireMetadataType,
  BuildingMetadata,
  ResourceQuantityType,
  ResourceId,
  ResourceMetadata,
  WorkshopRecipeMetadata,
} from "../core/metadata";
import { EntityAdmin } from "../game/entity-admin";

export interface IBonfirePresenter extends IRender {
  readonly items: Ref<BonfireItem[]>;
}

export class BonfirePresenter implements IBonfirePresenter {
  readonly items: Ref<BonfireItem[]>;

  constructor(private readonly admin: EntityAdmin) {
    const items = Object.values(BonfireMetadata).map((e) =>
      this.newBonfireItem(e),
    );
    this.items = ref(items) as Ref<BonfireItem[]>;
  }

  render(): void {
    for (const item of unref(this.items)) {
      const metadata = BonfireMetadata[item.id];

      // update fulfillment values for tooltips
      for (const ingredient of item.ingredients) {
        const resource = this.admin.resource(ingredient.id);
        ingredient.fulfillment = resource.state.amount;
      }

      // Update unlocked status
      if (metadata.intent.kind == "buy-building") {
        const building = this.admin.building(metadata.intent.buildingId);
        building.changes.apply((key) => {
          switch (key) {
            case "unlocked":
              item.unlocked = building.state.unlocked;
              break;
            case "level":
              item.level = building.state.level;
              break;
            case "ingredients":
              this.updatePrices(item, building);
              break;
          }
        });
      }
    }
  }

  private updatePrices(item: BonfireItem, entity: BuildingEntity): void {
    for (let i = 0; i < item.ingredients.length; i++) {
      const itemIngredient = item.ingredients[i];
      const entityIngredient = entity.price.ingredients[i];
      itemIngredient.requirement = entityIngredient.amount;
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
  level?: number;
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
