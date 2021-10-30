export type BonfireBuildingId = "catnip-field" | "hut" | "library";
export type BuildingId = BonfireBuildingId;
export type JobId = "woodcutter" | "scholar" | "farmer";
export type PopId = `pop-${number}`;
export type RecipeId = "refine-catnip";
export type ResourceId =
  | "catnip"
  | "wood"
  | "kittens"
  | "catpower"
  | "science"
  | "culture";
export type SeasonId = "spring" | "summer" | "autumn" | "winter";
export type SectionId = "bonfire" | "society" | "science";
export type StockpileId = "kitten-growth" | "observe-sky";
export type TechId = "calendar" | "agriculture";
export type WeatherId = "neutral" | "warm" | "cold";

export type BonfireItemId =
  | "gather-catnip"
  | "refine-catnip"
  | BonfireBuildingId;
