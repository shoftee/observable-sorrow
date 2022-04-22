import { ResourceId, DeltaEffectId, LimitEffectId } from "@/app/interfaces";

export enum UnlockMode {
  FirstQuantity = 0,
  FirstCapacity = 1,
}

export enum Flag {
  RelockWhenDepleted,
}

type Flags = Partial<{ [key in keyof typeof Flag]: boolean }>;

type ResourceEffectsType = Readonly<{
  delta?: DeltaEffectId;
  limit?: LimitEffectId;
}>;

export type ResourceMetadataType = Readonly<{
  id: ResourceId;
  label: string;
  unlockMode?: UnlockMode;
  effects: ResourceEffectsType;
  flags: Flags;
}>;

export const ResourceMetadata: Record<ResourceId, ResourceMetadataType> = {
  catnip: {
    id: "catnip",
    label: "resources.catnip.label",
    effects: {
      delta: "catnip.delta",
      limit: "catnip.limit",
    },
    flags: {},
  },
  wood: {
    id: "wood",
    label: "resources.wood.label",
    effects: {
      limit: "wood.limit",
      delta: "wood.delta",
    },
    flags: {},
  },
  minerals: {
    id: "minerals",
    label: "resources.minerals.label",
    effects: {
      limit: "minerals.limit",
      delta: "minerals.delta",
    },
    flags: {},
  },
  kittens: {
    id: "kittens",
    label: "resources.kittens.label",
    unlockMode: UnlockMode.FirstCapacity,
    effects: {
      limit: "kittens.limit",
    },
    flags: {},
  },
  science: {
    id: "science",
    label: "resources.science.label",
    effects: {
      delta: "science.delta",
      limit: "science.limit",
    },
    flags: {},
  },
  catpower: {
    id: "catpower",
    label: "resources.catpower.label",
    effects: {
      delta: "catpower.delta",
      limit: "catpower.limit",
    },
    flags: {},
  },
};

export interface ResourceState {
  unlocked: boolean;
  amount: number;
  change: number;
  capacity: number | undefined;
}
