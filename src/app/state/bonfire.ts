export type BonfireBuildingId =
  | "catnip-field"
  | "hut"
  | "library"
  | "barn"
  | "mine";

export type BonfireItemId =
  | "gather-catnip"
  | "refine-catnip"
  | BonfireBuildingId;

export const BonfireItems: BonfireItemId[] = [
  "gather-catnip",
  "refine-catnip",
  "catnip-field",
  "hut",
  "library",
  "barn",
  "mine",
];
