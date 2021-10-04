import { ResourceId, LimitEffectId, ProductionEffectId } from "@/_interfaces";

export enum Flag {
  RelockedWhenDepleted,
}

type Flags = Partial<{ [key in keyof typeof Flag]: boolean }>;

export type ResourceMetadataType = Readonly<{
  id: ResourceId;
  label: string;
  effects: {
    limit?: LimitEffectId;
    production?: ProductionEffectId;
  };
  flags: Flags;
}>;

export const ResourceMetadata: Record<ResourceId, ResourceMetadataType> = {
  catnip: {
    id: "catnip",
    label: "resources.catnip.label",
    effects: {
      limit: "catnip.limit",
      production: "catnip.production",
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
