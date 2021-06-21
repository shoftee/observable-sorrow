import { ResourceId } from "../resources/metadata";

export type RecipeId = "gather-catnip" | "refine-catnip";

type RecipeResourceType = {
  id: ResourceId;
  amount: number;
};

export type RecipeMetadataType = {
  id: RecipeId;
  title: string;
  desc: string;
  ingredients: RecipeResourceType[];
  results: RecipeResourceType[];
};

export const RecipeMetadata: Record<RecipeId, RecipeMetadataType> = {
  "gather-catnip": {
    id: "gather-catnip",
    title: "bonfire.gather-catnip.title",
    desc: "bonfire.gather-catnip.desc",
    ingredients: [], // Free recipe.
    results: [{ id: "catnip", amount: 1 }],
  },
  "refine-catnip": {
    id: "refine-catnip",
    title: "bonfire.refine-catnip.title",
    desc: "bonfire.refine-catnip.desc",
    ingredients: [{ id: "catnip", amount: 100 }],
    results: [{ id: "wood", amount: 1 }],
  },
};
