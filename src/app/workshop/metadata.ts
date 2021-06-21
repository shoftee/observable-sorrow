import { ResourceId } from "../resources/metadata";

export type RecipeId = "gather-catnip" | "refine-catnip";

type RecipeResourceType = {
  id: ResourceId;
  amount: number;
};

export type RecipeMetadataType = {
  id: RecipeId;
  ingredients: RecipeResourceType[];
  results: RecipeResourceType[];
};

export const RecipeMetadata: Record<RecipeId, RecipeMetadataType> = {
  "gather-catnip": {
    id: "gather-catnip",
    ingredients: [], // Free recipe.
    results: [{ id: "catnip", amount: 1 }],
  },
  "refine-catnip": {
    id: "refine-catnip",
    ingredients: [{ id: "catnip", amount: 100 }],
    results: [{ id: "wood", amount: 1 }],
  },
};
