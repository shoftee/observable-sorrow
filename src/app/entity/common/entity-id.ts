import { BuildingId, EffectId, RecipeId, ResourceId } from "@/_interfaces/id";

export type EntityId =
  | ResourceId
  | BuildingId
  | RecipeId
  | EffectId
  | "environment"
  | "time"
  | "population";
