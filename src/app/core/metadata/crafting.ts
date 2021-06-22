import { ResourceQuantityType } from "./recipes";

export type WorkshopRecipeId = "refine-catnip";

export type WorkshopRecipeType = {
  id: WorkshopRecipeId;
  ingredients: ResourceQuantityType[];
  products: ResourceQuantityType[];
};

export const WorkshopRecipeMetadata: Record<
  WorkshopRecipeId,
  WorkshopRecipeType
> = {
  "refine-catnip": {
    id: "refine-catnip",
    ingredients: [{ id: "catnip", amount: 100 }],
    products: [{ id: "wood", amount: 1 }],
  },
};
