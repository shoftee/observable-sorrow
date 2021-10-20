import {
  BuildingId,
  EffectId,
  PopId,
  RecipeId,
  ResourceId,
} from "@/app/interfaces";

export type PoolEntityId =
  | "buildings"
  | "effects"
  | "pops"
  | "recipes"
  | "resources"
  | "pops";

export type EntityId =
  | PoolEntityId
  | ResourceId
  | BuildingId
  | RecipeId
  | EffectId
  | PopId
  | "environment"
  | "player"
  | "prng"
  | "society"
  | "time";
