import {
  BooleanEffectId,
  BuildingId,
  JobId,
  NumberEffectId,
  PopId,
  RecipeId,
  ResourceId,
  SectionId,
  StockpileId,
  TechId,
} from "@/app/interfaces";

export type SingletonEntityId =
  | "effect-tree"
  | "environment"
  | "player"
  | "prng"
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
  stockpiles: StockpileId;
  techs: TechId;
}

export type PoolId = keyof PoolIdMap;
export type EntityId = PoolIdMap[PoolId];

export type EventId = "history";
