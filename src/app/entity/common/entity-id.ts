import { BuildingId, EffectId, RecipeId, ResourceId } from "@/_interfaces";

export type EntityId =
  | ResourceId
  | BuildingId
  | RecipeId
  | EffectId
  | "environment"
  | "time"
  | "population";
