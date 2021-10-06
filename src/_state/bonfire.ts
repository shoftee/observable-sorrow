import { BonfireBuildingId, BonfireItemId } from "../_interfaces/id";

type BonfireIntentType =
  | { kind: "gather-catnip"; amount: number }
  | { kind: "refine-catnip"; recipeId: "refine-catnip" }
  | { kind: "buy-building"; buildingId: BonfireBuildingId };

export type BonfireMetadataType = {
  id: BonfireItemId;
  intent: BonfireIntentType;
  label: string;
  description: string;
  flavor?: string;
};

export const BonfireMetadata: Record<BonfireItemId, BonfireMetadataType> = {
  "gather-catnip": {
    id: "gather-catnip",
    intent: { kind: "gather-catnip", amount: 100 },
    label: "bonfire.gather-catnip.label",
    description: "bonfire.gather-catnip.description",
  },
  "refine-catnip": {
    id: "refine-catnip",
    intent: { kind: "refine-catnip", recipeId: "refine-catnip" },
    label: "bonfire.refine-catnip.label",
    description: "bonfire.refine-catnip.description",
    flavor: "bonfire.refine-catnip.flavor",
  },
  "catnip-field": {
    id: "catnip-field",
    intent: buyBuildingIntent("catnip-field"),
    label: "bonfire.catnip-field.label",
    description: "bonfire.catnip-field.description",
    flavor: "bonfire.catnip-field.flavor",
  },
  hut: {
    id: "hut",
    intent: buyBuildingIntent("hut"),
    label: "bonfire.hut.label",
    description: "bonfire.hut.description",
    flavor: "bonfire.hut.flavor",
  },
};

function buyBuildingIntent(buildingId: BonfireBuildingId): BonfireIntentType {
  return { kind: "buy-building", buildingId };
}
