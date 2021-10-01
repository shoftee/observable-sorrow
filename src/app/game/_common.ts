import { BuildingId, ResourceId } from "@/_interfaces/id";

export type EntityId =
  | ResourceId
  | BuildingId
  | "effects"
  | "environment"
  | "timers"
  | "workshop";
