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

export type SingletonEntityId =
  | "environment"
  | "player"
  | "prng"
  | "society"
  | "time";

export interface PoolIdMap {
  singletons: SingletonEntityId;

  booleans: BooleanEffectId;
  buildings: BuildingId;
  jobs: JobId;
  numbers: NumberEffectId;
  pops: PopId;
  recipes: RecipeId;
  resources: ResourceId;
  sections: SectionId;
  techs: TechId;
}

export type PoolId = keyof PoolIdMap;
export type EntityId = PoolIdMap[PoolId];
