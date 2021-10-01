import { ResourceId, LimitEffectId, ProductionEffectId } from "@/_interfaces";

export enum Flag {
  RelockedWhenDepleted,
}

type Flags = Partial<{ [key in keyof typeof Flag]: boolean }>;

export type ResourceMetadataType = {
  readonly id: ResourceId;
  readonly label: string;
  readonly limitEffect: LimitEffectId;
  readonly productionEffect: ProductionEffectId;
  readonly flags: Flags;
};

export const ResourceMetadata: Record<ResourceId, ResourceMetadataType> = {
  catnip: {
    id: "catnip",
    label: "resources.catnip.label",
    limitEffect: "catnip-limit",
    productionEffect: "catnip-production",
    flags: {},
  },
  wood: {
    id: "wood",
    label: "resources.wood.label",
    limitEffect: "wood-limit",
    productionEffect: "wood-production",
    flags: {},
  },
};
