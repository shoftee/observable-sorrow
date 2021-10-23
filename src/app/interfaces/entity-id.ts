import {
  BooleanEffectId,
  BuildingId,
  JobId,
  NumberEffectId,
  PopId,
  RecipeId,
  ResourceId,
  SectionId,
} from "@/app/interfaces";

export type PoolEntityId =
  | "booleans"
  | "buildings"
  | "jobs"
  | "numbers"
  | "pops"
  | "recipes"
  | "resources"
  | "sections";

export type EntityId =
  | BooleanEffectId
  | BuildingId
  | JobId
  | NumberEffectId
  | PoolEntityId
  | PopId
  | RecipeId
  | ResourceId
  | SectionId
  | "environment"
  | "player"
  | "prng"
  | "society"
  | "time";
