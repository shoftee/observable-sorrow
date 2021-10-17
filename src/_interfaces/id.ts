export type BonfireBuildingId = "catnip-field" | "hut";

export type BonfireItemId =
  | "gather-catnip"
  | "refine-catnip"
  | BonfireBuildingId;

export type ResourceId = "catnip" | "wood" | "kittens" | "catpower";

export type BuildingId = BonfireBuildingId;

export type PopId = `pop-${number}`;
export type JobId = "woodcutter";

export type RecipeId = "refine-catnip";
export type SeasonId = "spring" | "summer" | "autumn" | "winter";
export type WeatherId = "neutral" | "warm" | "cold";
