import { ConstructionIntent, Intent } from "../interfaces";
import { BonfireItemId, BuildingId } from "../interfaces/id";

export type BonfireMetadataType = Readonly<{
  id: BonfireItemId;
  intent: Intent;
  label: string;
  description: string;
  flavor?: string;
}>;

export const BonfireMetadata: Record<BonfireItemId, BonfireMetadataType> = {
  "gather-catnip": {
    id: "gather-catnip",
    intent: { kind: "bonfire", id: "gather-catnip" },
    label: "bonfire.gather-catnip.label",
    description: "bonfire.gather-catnip.description",
  },
  "refine-catnip": {
    id: "refine-catnip",
    intent: { kind: "workshop", id: "craft-recipe", recipe: "refine-catnip" },
    label: "bonfire.refine-catnip.label",
    description: "bonfire.refine-catnip.description",
    flavor: "bonfire.refine-catnip.flavor",
  },
  "catnip-field": {
    id: "catnip-field",
    intent: buyBuilding("catnip-field"),
    label: "buildings.catnip-field.label",
    description: "buildings.catnip-field.description",
    flavor: "buildings.catnip-field.flavor",
  },
  hut: {
    id: "hut",
    intent: buyBuilding("hut"),
    label: "buildings.hut.label",
    description: "buildings.hut.description",
    flavor: "buildings.hut.flavor",
  },
  library: {
    id: "library",
    intent: buyBuilding("library"),
    label: "buildings.library.label",
    description: "buildings.library.description",
    flavor: "buildings.library.flavor",
  },
};

function buyBuilding(id: BuildingId): ConstructionIntent {
  return { kind: "construction", id: "buy-building", building: id };
}
