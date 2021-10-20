import { EffectId, BuildingId } from "@/app/interfaces";
import { IngredientState, ResourcesType } from "./common/types";

export type BuildingEffectType = Readonly<{
  id: string;
  per: EffectId;
  total: EffectId;
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
        label: "building-effects.catnip-field.catnip.label",
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
        id: "catpower",
        per: "hut.catpower.base",
        total: "hut.catpower",
        label: "building-effects.hut.catpower.label",
      },
      {
        id: "kittens",
        per: "hut.kittens.base",
        total: "hut.kittens",
        label: "building-effects.hut.kittens.label",
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
