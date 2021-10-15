import { BuildingId, EffectId, RecipeId, ResourceId } from "@/_interfaces";

export type PoolEntityId =
  | "buildings"
  | "effects"
  | "pops"
  | "recipes"
  | "resources";

export type EntityId =
  | PoolEntityId
  | ResourceId
  | BuildingId
  | RecipeId
  | EffectId
  | "environment"
  | "time"
  | "society";
