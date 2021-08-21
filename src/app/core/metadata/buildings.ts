import { ProductionEffectId } from "./effects";
import { ResourceQuantityType } from "./recipes";

export type BuildingId = "catnip-field";

export type BuildingMetadataType = {
  id: BuildingId;
  unlockRatio: number;
  prices: {
    ratio: number;
    ingredients: ResourceQuantityType[];
  };
  effects: {
    production: ProductionEffectId[];
  };
};

export const BuildingMetadata: Record<BuildingId, BuildingMetadataType> = {
  "catnip-field": {
    id: "catnip-field",
    prices: {
      ratio: 1.12,
      ingredients: [{ id: "catnip", amount: 10 }],
    },
    unlockRatio: 0.3,
    effects: {
      production: ["catnip-field-production"],
    },
  },
};
