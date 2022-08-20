import { RecipeId } from "@/app/interfaces";
import { ResourceMap, ResourcesType } from "@/app/state";

export type RecipeMetadataType = Readonly<{
  id: RecipeId;
  /** The ingredients for crafting this recipe. */
  ingredients: ResourcesType;
  /** The resources produced by crafting this recipe. */
  products: ResourcesType;
}>;

export const RecipeMetadata: Record<RecipeId, RecipeMetadataType> = {
  "refine-catnip": {
    id: "refine-catnip",
    ingredients: { catnip: 10 },
    products: { wood: 1 },
  },
};

export interface RecipeState {
  readonly products: ResourceMap;
}
