import {
  BooleanEffectId,
  BuildingId,
  JobId,
  NumberEffectId,
  PopId,
  RecipeId,
  ResourceId,
  SectionId,
  TechnologyId,
} from "@/app/interfaces";

export type PoolEntityId =
  | "booleans"
  | "buildings"
  | "jobs"
  | "numbers"
  | "pops"
  | "recipes"
  | "resources"
  | "sections"
  | "technologies";

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
  | TechnologyId
  | "environment"
  | "player"
  | "prng"
  | "society"
  | "time";
