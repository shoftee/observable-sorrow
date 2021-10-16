import { EffectId, ResourceId } from "@/_interfaces";

type ResourceQty = [ResourceId, number];

function toIterable(resources: ResourcesType): Iterable<ResourceQty> {
  return Object.entries(resources) as Iterable<ResourceQty>;
}

export class ResourceMap extends Map<ResourceId, number> {
  static fromObject(obj: ResourcesType): ResourceMap {
    return new ResourceMap(toIterable(obj));
  }
}

export class IngredientState {
  readonly resourceId: ResourceId;
  requirement: number;

  fulfillmentTime: number | undefined;
  fulfillment = 0;
  capped = false;
  fulfilled = true;

  constructor(resourceId: ResourceId, requirement: number) {
    this.resourceId = resourceId;
    this.requirement = requirement;
  }

  static fromObject(obj: ResourcesType): IngredientState[] {
    return Array.from(
      toIterable(obj),
      ([id, amount]) => new IngredientState(id, amount),
    );
  }
}

export type ResourceQuantityType = {
  readonly id: ResourceId;
  readonly quantity: number;
};

export type EffectQuantityType = {
  readonly id: EffectId;
  readonly amount: number;
};

export type ResourcesType = Readonly<Partial<Record<ResourceId, number>>>;
