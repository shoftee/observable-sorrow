import { EffectId, BuildingId } from "@/_interfaces";
import { IngredientState, ResourcesType } from "./common/types";

export type BuildingEffectType = Readonly<{
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
        per: "hut.catpower.base",
        total: "hut.catpower",
        label: "building-effects.hut.catpower.label",
      },
      {
        per: "hut.kittens.base",
        total: "hut.kittens",
        label: "building-effects.hut.kittens.label",
      },
    ],
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
    this.ingredients = IngredientState.fromObject(meta.prices.base);
  }
}
