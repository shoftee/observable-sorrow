import { BuildingCountId } from ".";
import { BuildingId, EffectId } from "./_id";
import { ResourceQuantityType } from "./_types";

export type BuildingEffectType = {
  id: EffectId;
  label: string;
};

export type BuildingMetadataType = {
  id: BuildingId;
  unlockRatio: number;
  prices: {
    ratio: number;
    baseIngredients: ResourceQuantityType[];
  };
  effects: {
    count: BuildingCountId;
    production: BuildingEffectType[];
  };
};

export const BuildingMetadata: Record<BuildingId, BuildingMetadataType> = {
  "catnip-field": {
    id: "catnip-field",
    prices: {
      ratio: 1.12,
      baseIngredients: [{ id: "catnip", amount: 10 }],
    },
    unlockRatio: 0.3,
    effects: {
      count: "catnip-field-count",
      production: [
        {
          id: "catnip-field-base-catnip",
          label: "building-effects.catnip-field.catnip-production.label",
        },
      ],
    },
  },
};
