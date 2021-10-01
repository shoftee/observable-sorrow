import {
  EffectId,
  BuildingId,
  BuildingCountId,
  ResourceId,
} from "@/_interfaces";
import { ResourceMap } from "./_types";

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
    baseIngredients: ResourceMap;
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
      baseIngredients: new ResourceMap([["catnip", 10]]),
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

export class BuildingState {
  readonly ingredients: Map<ResourceId, number>;
  unlocked = false;
  level = 0;

  constructor(id: BuildingId) {
    const meta = BuildingMetadata[id];
    this.ingredients = new ResourceMap(meta.prices.baseIngredients);
  }
}
