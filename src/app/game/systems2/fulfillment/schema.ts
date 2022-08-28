import { ResourceId } from "@/app/interfaces";

import { SchemaEntity } from "../core/schema";

export type FulfillmentSchema = {
  fulfilled: boolean;
  capped: boolean;
  unlocked: boolean;
  ingredients: IngredientsSchema;
};

export type IngredientSchema = SchemaEntity<{
  requirement: number;
  fulfilled: boolean;
  eta: number | undefined;
  capped: boolean;
  ingredients: IngredientsSchema;
}>;

export type IngredientsSchema = Partial<{
  [K in ResourceId]: IngredientSchema;
}>;

export type BuildingSchema = {
  level: number;
};
