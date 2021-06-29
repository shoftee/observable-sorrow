import { ProductionEffectType } from ".";
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
    production: ProductionEffectType[];
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
      production: [
        { id: "catnip-field-production", resourceId: "catnip", amount: 0.025 },
      ],
    },
  },
};
