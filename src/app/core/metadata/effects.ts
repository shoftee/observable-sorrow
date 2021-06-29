import { ResourceId } from ".";

export type ProductionEffectId = "catnip-field-production";

export type ProductionEffectType = {
  id: ProductionEffectId;
  resourceId: ResourceId;
  amount: number;
};

type LocalizationData = {
  label: string;
};

export const ProductionEffectMetadata: Record<
  ProductionEffectId,
  LocalizationData
> = {
  "catnip-field-production": {
    label: "effects.catnip-field-production.label",
  },
};
