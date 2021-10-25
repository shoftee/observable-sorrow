import {
  BooleanEffectId,
  BuildingId,
  JobId,
  NumberEffectId,
  PopId,
  RecipeId,
  ResourceId,
  SectionId,
  TechId,
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
  | "techs";

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
  | TechId
  | "environment"
  | "player"
  | "prng"
  | "society"
  | "time";
