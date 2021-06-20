import { ResourceId } from "../resources/metadata";

export type RecipeId = "gather-catnip" | "refine-catnip";

type RecipeIngredientType = {
  id: ResourceId;
  amount: number;
};

export type RecipeMetadataType = {
  id: RecipeId;
  title: string;
  desc: string;
  ingredients: RecipeIngredientType[];
};

export const RecipeMetadata: Record<RecipeId, RecipeMetadataType> = {
  "gather-catnip": {
    id: "gather-catnip",
    title: "bonfire.gather-catnip.title",
    desc: "bonfire.gather-catnip.desc",
    ingredients: [
      // Free recipe.
    ],
  },
  "refine-catnip": {
    id: "refine-catnip",
    title: "bonfire.refine-catnip.title",
    desc: "bonfire.refine-catnip.desc",
    ingredients: [{ id: "catnip", amount: 100 }],
  },
};
