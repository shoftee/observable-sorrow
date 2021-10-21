import {
  BuildingId,
  NumberEffectId,
  PopId,
  RecipeId,
  ResourceId,
} from "@/app/interfaces";

export type PoolEntityId =
  | "buildings"
  | "numbers"
  | "pops"
  | "recipes"
  | "resources";

export type EntityId =
  | PoolEntityId
  | ResourceId
  | BuildingId
  | RecipeId
  | NumberEffectId
  | PopId
  | "environment"
  | "player"
  | "prng"
  | "society"
  | "time";
