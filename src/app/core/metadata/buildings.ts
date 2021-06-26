import { ProductionEffectType } from ".";
import { ResourceQuantityType } from "./recipes";

export type BuildingId = "catnip-field";

export type BuildingMetadataType = {
  id: BuildingId;
  effects: {
    prices: {
      ratio: number;
      ingredients: ResourceQuantityType[];
    };
    production: ProductionEffectType[];
  };
  unlockRatio: number;
};

export const BuildingMetadata: Record<BuildingId, BuildingMetadataType> = {
  "catnip-field": {
    id: "catnip-field",
    effects: {
      prices: {
        ratio: 1.12,
        ingredients: [{ id: "catnip", amount: 10 }],
      },
      production: [
        { id: "catnip-production", resourceId: "catnip", amount: 0.025 },
      ],
    },
    unlockRatio: 0.3,
  },
};
