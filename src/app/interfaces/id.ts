export type BonfireBuildingId = "catnip-field" | "hut" | "library";

export type BonfireItemId =
  | "gather-catnip"
  | "refine-catnip"
  | BonfireBuildingId;

export type ResourceId = "catnip" | "wood" | "kittens" | "catpower" | "science";

export type BuildingId = BonfireBuildingId;

export type PopId = `pop-${number}`;
export type JobId = "woodcutter" | "scholar";

export type RecipeId = "refine-catnip";
export type SeasonId = "spring" | "summer" | "autumn" | "winter";
export type WeatherId = "neutral" | "warm" | "cold";

export type SectionId = "bonfire" | "society" | "science";
