import { ResourceId } from ".";

export type ProductionEffectId = "catnip-field-production";

export type ProductionEffectType = {
  id: ProductionEffectId;
  resourceId: ResourceId;
  amount: number;
};

export type ProductionEffectMetadataType = ProductionEffectType & {
  label: string;
};

export const ProductionEffectMetadata: Record<
  ProductionEffectId,
  ProductionEffectMetadataType
> = {
  "catnip-field-production": {
    id: "catnip-field-production",
    resourceId: "catnip",
    amount: 0.025,
    label: "effects.catnip-field-production.label",
  },
};
