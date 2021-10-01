import { WorkshopRecipeId } from "@/_interfaces";
import { ResourceMap } from "@/_state";

export type WorkshopRecipeType = {
  id: WorkshopRecipeId;
  ingredients: ResourceMap;
  products: ResourceMap;
};

export const WorkshopRecipeMetadata: Record<
  WorkshopRecipeId,
  WorkshopRecipeType
> = {
  "refine-catnip": {
    id: "refine-catnip",
    ingredients: new ResourceMap([["catnip", 100]]),
    products: new ResourceMap([["wood", 1]]),
  },
};
