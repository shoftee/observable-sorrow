export type BonfireItemId = "gather-catnip" | "refine-catnip" | "catnip-field";

export type BonfireBuildingId = "catnip-field";

type BonfireIntentType =
  | { kind: "gather-catnip"; amount: number }
  | { kind: "refine-catnip"; recipeId: "refine-catnip" }
  | { kind: "buy-building"; buildingId: BonfireBuildingId };

export type BonfireMetadataType = {
  id: BonfireItemId;
  label: string;
  description: string;
  flavor?: string;
  intent: BonfireIntentType;
};

export const BonfireMetadata: Record<BonfireItemId, BonfireMetadataType> = {
  "gather-catnip": {
    id: "gather-catnip",
    intent: { kind: "gather-catnip", amount: 1 },
    label: "bonfire.gather-catnip.label",
    description: "bonfire.gather-catnip.description",
  },
  "refine-catnip": {
    id: "refine-catnip",
    intent: { kind: "refine-catnip", recipeId: "refine-catnip" },
    label: "bonfire.refine-catnip.label",
    description: "bonfire.refine-catnip.description",
  },
  "catnip-field": {
    id: "catnip-field",
    intent: { kind: "buy-building", buildingId: "catnip-field" },
    label: "bonfire.catnip-field.label",
    description: "bonfire.catnip-field.description",
    flavor: "bonfire.catnip-field.flavor",
  },
};
