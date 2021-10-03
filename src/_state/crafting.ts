import { RecipeId, ResourceId } from "@/_interfaces";
import { IngredientState, ResourceMap } from "@/_state";

export type RecipeType = {
  id: RecipeId;
  ingredients: ResourceMap;
  products: ResourceMap;
};

export const RecipeMetadata: Record<RecipeId, RecipeType> = {
  "refine-catnip": {
    id: "refine-catnip",
    ingredients: new ResourceMap([["catnip", 100]]),
    products: new ResourceMap([["wood", 1]]),
  },
};

export class RecipeState {
  readonly ingredients: IngredientState[];
  readonly products: ResourceMap;

  capped = false;
  fulfilled = false;

  constructor(id: RecipeId) {
    this.ingredients = Array.from(
      RecipeMetadata[id].ingredients.entries(),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ([id, amount]) => new IngredientState(id as ResourceId, amount!),
    );
    this.products = new ResourceMap(RecipeMetadata[id].products);
  }
}
