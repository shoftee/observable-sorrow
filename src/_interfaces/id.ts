export type BonfireBuildingId = "catnip-field";

export type BonfireItemId =
  | "gather-catnip"
  | "refine-catnip"
  | BonfireBuildingId;

export type ResourceId = "catnip" | "wood";

export type BuildingId = "catnip-field";
export type BuildingCountId = `${BuildingId}-count`;

export type ProductionEffectId = "catnip-production" | "wood-production";

export type LimitEffectId =
  | "catnip-limit"
  | "catnip-limit-base"
  | "wood-limit"
  | "wood-limit-base";

export type CatnipFieldEffectId =
  | "catnip-field-production"
  | "catnip-field-weather"
  | "catnip-field-base-catnip";

export type EffectId =
  | ProductionEffectId
  | LimitEffectId
  | BuildingCountId
  | CatnipFieldEffectId
  | "weather-season-modifier"
  | "weather-severity-modifier";

export type RecipeId = "refine-catnip";
export type SeasonId = "spring" | "summer" | "autumn" | "winter";
export type WeatherId = "neutral" | "warm" | "cold";
