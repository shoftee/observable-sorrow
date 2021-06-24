import { ResourceQuantityType } from "./recipes";

export type BuildingId = "catnip-field";

export type BuildingMetadataType = {
  id: BuildingId;
  ingredients: ResourceQuantityType[];
  unlockRatio: number;
  priceRatio: number;
};

export const BuildingMetadata: Record<BuildingId, BuildingMetadataType> = {
  "catnip-field": {
    id: "catnip-field",
    ingredients: [{ id: "catnip", amount: 10 }],
    unlockRatio: 0.3,
    priceRatio: 1.12,
  },
};
