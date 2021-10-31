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
    ],
  },
  barn: {
    id: "barn",
    unlock: {
      priceRatio: 0.3,
      unlockEffect: "unlock.building.barn",
    },
    prices: {
      base: { wood: 50 },
      ratio: 1.75,
    },
    effects: [
      {
        id: "catnip-limit",
        per: "barn.catnip-limit.base",
        total: "barn.catnip-limit",
        label: "buildings.barn.effects.catnip-limit",
      },
      {
        id: "wood-limit",
        per: "barn.wood-limit.base",
        total: "barn.wood-limit",
        label: "buildings.barn.effects.wood-limit",
      },
      {
        id: "minerals-limit",
        per: "barn.minerals-limit.base",
        total: "barn.minerals-limit",
        label: "buildings.barn.effects.minerals-limit",
      },
    ],
  },
  mine: {
    id: "mine",
    unlock: {
      priceRatio: 0.15,
      unlockEffect: "unlock.building.mine",
    },
    prices: {
      base: { wood: 100 },
      ratio: 1.15,
    },
    effects: [
      {
        id: "mineral-ratio",
        per: "mine.minerals-ratio.base",
        total: "mine.minerals-ratio",
        label: "buildings.mine.effects.minerals-ratio",
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
