import { RecipeId } from "@/_interfaces";
import { IngredientState, ResourceMap, ResourcesType } from "@/_state";

export type RecipeType = Readonly<{
  id: RecipeId;
  ingredients: ResourcesType;
  products: ResourcesType;
}>;

export const RecipeMetadata: Record<RecipeId, RecipeType> = {
  "refine-catnip": {
    id: "refine-catnip",
    ingredients: { catnip: 100 },
    products: { wood: 1 },
  },
};

export class RecipeState {
  readonly ingredients: IngredientState[];
  readonly products: ResourceMap;

  capped = false;
  fulfilled = false;

  constructor(id: RecipeId) {
    this.ingredients = IngredientState.fromObject(
      RecipeMetadata[id].ingredients,
    );
    this.products = ResourceMap.fromObject(RecipeMetadata[id].products);
  }
}
