import { RecipeId } from "@/_interfaces";
import { IngredientState, ResourceMap, ResourcesType } from "@/_state";

export type RecipeMetadataType = Readonly<{
  id: RecipeId;
  ingredients: ResourcesType;
  products: ResourcesType;
}>;

export const RecipeMetadata: Record<RecipeId, RecipeMetadataType> = {
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

  constructor(meta: RecipeMetadataType) {
    this.ingredients = IngredientState.fromObject(meta.ingredients);
    this.products = ResourceMap.fromObject(meta.products);
  }
}
