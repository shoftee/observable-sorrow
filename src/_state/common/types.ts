import { EffectId, ResourceId } from "@/_interfaces";

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
    return IngredientState.fromIterable(toIterable(obj));
  }

  private static fromIterable(
    iterable: Iterable<[ResourceId, number]>,
  ): IngredientState[] {
    return Array.from(
      iterable,
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

export function toIterable(
  resources: ResourcesType,
): Iterable<[ResourceId, number]> {
  return Object.entries(resources) as Iterable<[ResourceId, number]>;
}
