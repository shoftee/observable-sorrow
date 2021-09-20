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

export type WeatherId = "neutral" | "warm" | "cold";

export type WeatherMetadataType = {
  id: WeatherId;
  adjustment: number;
  label?: string;
};

export const WeatherMetadata: Record<WeatherId, WeatherMetadataType> = {
  neutral: {
    id: "neutral",
    adjustment: 0,
  },
  warm: {
    id: "warm",
    adjustment: +0.15,
    label: "environment.weather.warm",
  },
  cold: {
    id: "cold",
    adjustment: -0.15,
    label: "environment.weather.cold",
  },
};
