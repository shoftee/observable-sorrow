import { BuildingId, EffectId, RecipeId, ResourceId } from "@/_interfaces";

export type PooledEntityId = "pops" | "resources" | "buildings" | "recipes";

export type EntityId =
  | PooledEntityId
  | ResourceId
  | BuildingId
  | RecipeId
  | EffectId
  | "environment"
  | "time"
  | "society";
