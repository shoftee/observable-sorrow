export type BonfireBuildingId =
  | "catnip-field"
  | "hut"
  | "library"
  | "barn"
  | "mine";
export type BuildingId = BonfireBuildingId;
export type JobId = "woodcutter" | "scholar" | "farmer" | "miner";
export type PopId = `pop-${number}`;
export type RecipeId = "refine-catnip";
export type ResourceId = "catnip" | "wood" | "minerals" | "kittens" | "science";
export type SeasonId = "spring" | "summer" | "autumn" | "winter";
export type SectionId = "bonfire" | "society" | "science";
export type StockpileId = "kitten-growth" | "observe-sky";
export type TechId = "calendar" | "agriculture" | "mining";
export type WeatherId = "neutral" | "warm" | "cold";

export type BonfireItemId =
  | "gather-catnip"
  | "refine-catnip"
  | BonfireBuildingId;
