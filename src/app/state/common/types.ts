import { ResourceId } from "@/app/interfaces";

type ResourceQty = [ResourceId, number];

export type ResourceQuantityType = {
  readonly id: ResourceId;
  readonly quantity: number;
};

export type ResourcesType = Readonly<Partial<Record<ResourceId, number>>>;

function toIterable(resources: ResourcesType): Iterable<ResourceQty> {
  return Object.entries(resources) as Iterable<ResourceQty>;
}

export class ResourceMap extends Map<ResourceId, number> {
  static fromObject(obj: ResourcesType): ResourceMap {
    return new ResourceMap(toIterable(obj));
  }
}

export interface IngredientState {
  readonly resourceId: ResourceId;
  requirement: number;
  fulfillmentTime: number | undefined;
  fulfillment: number;
  capped: boolean;
  fulfilled: boolean;
}

export interface FulfillmentState {
  readonly ingredients: IngredientState[];
  fulfilled: boolean;
  capped: boolean;
}

export function ingredientsFromObject(obj: ResourcesType): IngredientState[] {
  return Array.from(toIterable(obj), ([id, amount]) => ({
    resourceId: id,
    requirement: amount,
    fulfillmentTime: undefined,
    fulfillment: 0,
    capped: false,
    fulfilled: true,
  }));
}
