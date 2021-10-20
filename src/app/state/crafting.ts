import { RecipeId } from "@/app/interfaces";
import { IngredientState, ResourceMap, ResourcesType } from "@/app/state";

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

export interface RecipeState {
  readonly ingredients: IngredientState[];
  readonly products: ResourceMap;
  capped: boolean;
  fulfilled: boolean;
}
