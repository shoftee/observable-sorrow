import {
  ResourceId,
  DeltaEffectId,
  LimitEffectId,
  ModifierEffectId,
} from "@/app/interfaces";

export enum UnlockMode {
  FirstQuantity = 0,
  FirstCapacity = 1,
}

type ResourceEffectsType = Readonly<{
  delta?: DeltaEffectId;
  limit?: LimitEffectId;
  modifier?: ModifierEffectId;
}>;

export type ResourceMetadataType = Readonly<{
  id: ResourceId;
  label: string;
  unlockMode?: UnlockMode;
  effects: ResourceEffectsType;
}>;

export const ResourceMetadata: Record<ResourceId, ResourceMetadataType> = {
  catnip: {
    id: "catnip",
    label: "resources.catnip.label",
    effects: {
      delta: "catnip.delta",
      limit: "catnip.limit",
      modifier: "weather.ratio",
    },
  },
  wood: {
    id: "wood",
    label: "resources.wood.label",
    effects: {
      limit: "wood.limit",
      delta: "wood.delta",
    },
  },
  minerals: {
    id: "minerals",
    label: "resources.minerals.label",
    effects: {
      limit: "minerals.limit",
      delta: "minerals.delta",
    },
  },
  catpower: {
    id: "catpower",
    label: "resources.catpower.label",
    effects: {
      delta: "catpower.delta",
      limit: "catpower.limit",
    },
  },
  science: {
    id: "science",
    label: "resources.science.label",
    effects: {
      delta: "science.delta",
      limit: "science.limit",
    },
  },
  kittens: {
    id: "kittens",
    label: "resources.kittens.label",
    unlockMode: UnlockMode.FirstCapacity,
    effects: {
      limit: "kittens.limit",
    },
  },
};

export interface ResourceState {
  unlocked: boolean;
  amount: number;
  change: number;
  capacity: number | undefined;
}
