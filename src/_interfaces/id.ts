export type BonfireBuildingId = "catnip-field";

export type BonfireItemId =
  | "gather-catnip"
  | "refine-catnip"
  | BonfireBuildingId;

export type ResourceId = "catnip" | "wood";
export type ProductionEffectId = `${ResourceId}.production`;

export type BuildingId = BonfireBuildingId;
export type BuildingCountId = `${BuildingId}.count`;

export type LimitEffectId =
  | "catnip.limit"
  | "catnip.limit.base"
  | "wood.limit"
  | "wood.limit.base";

export type CatnipFieldEffectId =
  | "catnip-field.weather"
  | "catnip-field.production.catnip"
  | "catnip-field.production.catnip.base";

export type EffectId =
  | ProductionEffectId
  | LimitEffectId
  | BuildingCountId
  | CatnipFieldEffectId
  | "weather.modifier.season"
  | "weather.modifier.severity";

export type RecipeId = "refine-catnip";
export type SeasonId = "spring" | "summer" | "autumn" | "winter";
export type WeatherId = "neutral" | "warm" | "cold";
