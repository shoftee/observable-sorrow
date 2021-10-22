import {
  BooleanEffectId,
  BuildingId,
  NumberEffectId,
  PopId,
  RecipeId,
  ResourceId,
  SectionId,
} from "@/app/interfaces";

export type PoolEntityId =
  | "buildings"
  | "numbers"
  | "booleans"
  | "pops"
  | "recipes"
  | "resources"
  | "sections";

export type EntityId =
  | BooleanEffectId
  | BuildingId
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
