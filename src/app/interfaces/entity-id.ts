import {
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
  | "pops"
  | "recipes"
  | "resources"
  | "sections";

export type EntityId =
  | PoolEntityId
  | ResourceId
  | BuildingId
  | RecipeId
  | NumberEffectId
  | PopId
  | SectionId
  | "environment"
  | "player"
  | "prng"
  | "society"
  | "time";
