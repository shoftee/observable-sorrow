import { ResourceQuantityType } from "./recipes";

export type BuildingId = "catnip-field";

type BuildingMetadataType = {
  id: BuildingId;
  ingredients: ResourceQuantityType[];
};

export const BuildingMetadata: Record<BuildingId, BuildingMetadataType> = {
  "catnip-field": {
    id: "catnip-field",
    ingredients: [{ id: "catnip", amount: 10 }],
  },
};
