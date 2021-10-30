import {
  NumberEffectId,
  BuildingId,
  BuildingUnlockEffectId,
} from "@/app/interfaces";

import { ResourcesType } from "./common/types";

export type BuildingEffectType = Readonly<{
  /** A unique key for the effect. */
  id: string;
  /** The name of the 'per-level' effect for the building. */
  per: NumberEffectId;
  /** The name of the 'total' effect for the building. */
  total: NumberEffectId;
  /** The label for the effect. */
  label: string;
}>;

type BuildingPricesType = Readonly<{
  /** Every level of the building will increase the ingredient requirements by this many times. */
  ratio: number;
  /** The ingredients required to build the first level of the building. */
  base: ResourcesType;
}>;

export type BuildingMetadataType = Readonly<{
  id: BuildingId;
  /** Unlock requirements for the building. */
  unlock?: BuildingUnlockType;
  /** Price definition for the building. */
  prices: BuildingPricesType;
  /** List of the effects of the building. */
  effects: BuildingEffectType[];
}>;

export type BuildingUnlockType = Readonly<{
  /** Until this effect is satisfied, the building will remain locked. */
  unlockEffect?: BuildingUnlockEffectId;
  /** When an ingredient resource reaches this fraction of its requirement, the building is unlocked. */
  priceRatio?: number;
}>;

export const BuildingMetadata: Record<BuildingId, BuildingMetadataType> = {
  "catnip-field": {
    id: "catnip-field",
    prices: {
      ratio: 1.12,
      base: { catnip: 10 },
    },
    unlock: { priceRatio: 0.3 },
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
    unlock: { priceRatio: 0.3 },
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
  library: {
    id: "library",
    prices: {
      base: { wood: 25 },
      ratio: 1.15,
    },
    unlock: { priceRatio: 0.3 },
    effects: [
      {
        id: "science-limit",
        per: "library.science-limit.base",
        total: "library.science-limit",
        label: "buildings.library.effects.science-limit",
      },
      {
        id: "science-ratio",
        per: "library.science-ratio.base",
        total: "library.science-ratio",
        label: "buildings.library.effects.science-ratio",
      },
      {
        id: "culture-limit",
        per: "library.culture-limit.base",
        total: "library.culture-limit",
        label: "buildings.library.effects.culture-limit",
      },
    ],
  },
};

export interface BuildingState {
  /** Whether the building is unlocked or not. */
  unlocked: boolean;
  /** The level of the building. */
  level: number;
}
