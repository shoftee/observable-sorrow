import { RecipeId } from "../workshop/metadata";

export type BonfireItemId = "gather-catnip" | "refine-catnip";
export type BonfireMetadataType = {
  id: BonfireItemId;
  recipeId: RecipeId;
  label: string;
  desc: string;
};

export const BonfireMetadata: Record<BonfireItemId, BonfireMetadataType> = {
  "gather-catnip": {
    id: "gather-catnip",
    recipeId: "gather-catnip",
    label: "bonfire.gather-catnip.label",
    desc: "bonfire.gather-catnip.desc",
  },
  "refine-catnip": {
    id: "refine-catnip",
    recipeId: "refine-catnip",
    label: "bonfire.refine-catnip.label",
    desc: "bonfire.refine-catnip.desc",
  },
};
