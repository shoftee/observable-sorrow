export type BonfireBuildingId = "catnip-field" | "hut";

export type BonfireItemId =
  | "gather-catnip"
  | "refine-catnip"
  | BonfireBuildingId;

export type ResourceId = "catnip" | "wood" | "kittens" | "catpower";
export type ProductionEffectId = `${ResourceId}.production`;

export type BuildingId = BonfireBuildingId;
export type BuildingCountId = `${BuildingId}.count`;

export type LimitEffectId =
  | "catnip.limit"
  | "catnip.limit.base"
  | "wood.limit"
  | "wood.limit.base"
  | "kittens.limit"
  | "catpower.limit";

export type CatnipFieldEffectId =
  | "catnip-field.weather"
  | "catnip-field.catnip"
  | "catnip-field.catnip.base";

export type HutEffectId =
  | "hut.catpower"
  | "hut.catpower.base"
  | "hut.kittens"
  | "hut.kittens.base";

export type EffectId =
  | ProductionEffectId
  | LimitEffectId
  | BuildingCountId
  | CatnipFieldEffectId
  | HutEffectId
  | "weather.modifier.season"
  | "weather.modifier.severity";

export type RecipeId = "refine-catnip";
export type SeasonId = "spring" | "summer" | "autumn" | "winter";
export type WeatherId = "neutral" | "warm" | "cold";
