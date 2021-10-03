import { BuildingId, RecipeId, ResourceId } from "@/_interfaces/id";

export type EntityId =
  | ResourceId
  | BuildingId
  | RecipeId
  | "effects"
  | "environment"
  | "timers";
