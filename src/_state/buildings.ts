import {
  EffectId,
  BuildingId,
  BuildingCountId,
  ResourceId,
} from "@/_interfaces";
import { IngredientState, ResourcesType } from "./common/types";

export type BuildingEffectType = Readonly<{
  per: EffectId;
  total: EffectId;
  label: string;
}>;

export type BuildingMetadataType = Readonly<{
  id: BuildingId;
  unlockRatio: number;
  prices: {
    ratio: number;
    base: ResourcesType;
  };
  effects: {
    count: BuildingCountId;
    resources: BuildingEffectType[];
  };
}>;

export const BuildingMetadata: Record<BuildingId, BuildingMetadataType> = {
  "catnip-field": {
    id: "catnip-field",
    prices: {
      ratio: 1.12,
      base: { catnip: 10 },
    },
    unlockRatio: 0.3,
    effects: {
      count: "catnip-field.count",
      resources: [
        {
          per: "catnip-field.production.catnip.base",
          total: "catnip-field.production.catnip",
          label: "building-effects.catnip-field.catnip-production.label",
        },
      ],
    },
  },
};

export class BuildingState {
  readonly ingredients: IngredientState[];
  unlocked = false;
  level = 0;
  capped = false;
  fulfilled = false;

  constructor(id: BuildingId) {
    const meta = BuildingMetadata[id];
    this.ingredients = Object.entries(meta.prices.base).map(
      ([id, requirement]) =>
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        new IngredientState(id as ResourceId, requirement!),
    );
  }
}
