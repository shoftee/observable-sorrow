import { NumberEffectId, BuildingId } from "@/app/interfaces";
import { IngredientState, ResourcesType } from "./common/types";

export type BuildingEffectType = Readonly<{
  id: string;
  per: NumberEffectId;
  total: NumberEffectId;
  label: string;
}>;

type BuildingPricesType = Readonly<{
  ratio: number;
  base: ResourcesType;
}>;

export type BuildingMetadataType = Readonly<{
  id: BuildingId;
  unlockRatio: number;
  prices: BuildingPricesType;
  effects: BuildingEffectType[];
}>;

export const BuildingMetadata: Record<BuildingId, BuildingMetadataType> = {
  "catnip-field": {
    id: "catnip-field",
    prices: {
      ratio: 1.12,
      base: { catnip: 10 },
    },
    unlockRatio: 0.3,
    effects: [
      {
        id: "catnip",
        per: "catnip-field.catnip.base",
        total: "catnip-field.catnip",
        label: "buildings.catnip-field.effects.catnip",
      },
    ],
  },
  hut: {
    id: "hut",
    prices: {
      ratio: 2.5,
      base: { wood: 5 },
    },
    unlockRatio: 0.3,
    effects: [
      {
        id: "catpower-limit",
        per: "hut.catpower-limit.base",
        total: "hut.catpower-limit",
        label: "buildings.hut.effects.catpower-limit",
      },
      {
        id: "kittens-limit",
        per: "hut.kittens-limit.base",
        total: "hut.kittens-limit",
        label: "buildings.hut.effects.kittens-limit",
      },
    ],
  },
};

export interface BuildingState {
  readonly ingredients: IngredientState[];
  unlocked: boolean;
  level: number;
  capped: boolean;
  fulfilled: boolean;
}
