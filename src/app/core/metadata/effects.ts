import { ResourceId } from ".";

export type ProductionEffectId = "catnip-production";

export type ProductionEffectType = {
  id: ProductionEffectId;
  resourceId: ResourceId;
  amount: number;
};

export type ProductionEffectMetadataType = {
  label: string;
};

export const ProductionEffectMetadata: Record<
  ProductionEffectId,
  ProductionEffectMetadataType
> = {
  "catnip-production": {
    label: "effects.catnip-production.label",
  },
};
