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
  | "effect-tree"
  | "environment"
  | "player"
  | "prng"
  | "society"
  | "time"
  | "logs";

export type FulfillmentId = BuildingId | RecipeId | TechId;

export interface PoolIdMap {
  singletons: SingletonEntityId;

  booleans: BooleanEffectId;
  buildings: BuildingId;
  fulfillments: FulfillmentId;
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

export type EventId = "history";
