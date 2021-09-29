import { BuildingCountId } from ".";
import { BuildingId, EffectId } from "../../../_interfaces/id";
import { ResourceQuantityType } from "./_types";

export type BuildingEffectType = {
  per: EffectId;
  total: EffectId;
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
    resources: BuildingEffectType[];
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
      resources: [
        {
          per: "catnip-field-base-catnip",
          total: "catnip-field-production",
          label: "building-effects.catnip-field.catnip-production.label",
        },
      ],
    },
  },
};
