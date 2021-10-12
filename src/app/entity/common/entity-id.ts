import { BuildingId, EffectId, RecipeId, ResourceId } from "@/_interfaces";

export type PooledEntityId =
  | "buildings"
  | "effects"
  | "pops"
  | "recipes"
  | "resources";

export type EntityId =
  | PooledEntityId
  | ResourceId
  | BuildingId
  | RecipeId
  | EffectId
  | "environment"
  | "time"
  | "society";
