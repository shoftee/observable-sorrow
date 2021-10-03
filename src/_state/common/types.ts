import { EffectId, ResourceId } from "@/_interfaces";

export class ResourceMap extends Map<ResourceId, number> {}

export class IngredientState {
  readonly resourceId: ResourceId;
  requirement: number;

  fulfillment = 0;
  capped = false;
  fulfilled = true;

  constructor(resourceId: ResourceId, requirement: number) {
    this.resourceId = resourceId;
    this.requirement = requirement;
  }
}

export type ResourceQuantityType = {
  id: ResourceId;
  quantity: number;
};

export type EffectQuantityType = {
  id: EffectId;
  amount: number;
};
