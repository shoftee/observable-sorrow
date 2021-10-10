import { ResourceId, LimitEffectId, DeltaEffectId } from "@/_interfaces";

export enum UnlockMode {
  FirstQuantity = 0,
  FirstCapacity = 1,
}

export enum Flag {
  RelockWhenDepleted,
}

type Flags = Partial<{ [key in keyof typeof Flag]: boolean }>;

type ResourceEffectsType = Readonly<{
  limit?: LimitEffectId;
  delta?: DeltaEffectId;
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
      limit: "catnip.limit",
      delta: "catnip.delta",
    },
    flags: {},
  },
  wood: {
    id: "wood",
    label: "resources.wood.label",
    effects: {
      limit: "wood.limit",
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
  catpower: {
    id: "catpower",
    label: "resources.catpower.label",
    effects: {
      limit: "catpower.limit",
    },
    flags: {},
  },
};

export class ResourceState {
  unlocked = false;
  amount = 0;
  change = 0;
  capacity?: number;
}
