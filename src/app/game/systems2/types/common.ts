import { ValueComponent } from "@/app/ecs";
import {
  BooleanEffectId,
  BuildingId,
  FulfillmentId,
  ResourceId,
} from "@/app/interfaces";

export class Level extends ValueComponent<number> {
  value = 0;
}

export class Unlocked extends ValueComponent<boolean> {
  constructor(public value: boolean) {
    super();
  }
}
export class PriceRatio extends ValueComponent<number> {
  constructor(public value: number) {
    super();
  }
}

export class UnlockOnEffect extends ValueComponent<BooleanEffectId> {
  constructor(readonly value: BooleanEffectId) {
    super();
  }
}

export class Fulfillment extends ValueComponent<FulfillmentId> {
  constructor(readonly value: FulfillmentId) {
    super();
  }
}

export class Building extends ValueComponent<BuildingId> {
  constructor(readonly value: BuildingId) {
    super();
  }
}

export class Resource extends ValueComponent<ResourceId> {
  constructor(readonly value: ResourceId) {
    super();
  }
}
