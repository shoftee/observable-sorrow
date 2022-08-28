import {
  BooleanEffectId,
  BuildingId,
  FulfillmentId,
  ResourceId,
} from "@/app/interfaces";

import { EcsComponent, ValueComponent } from "@/app/ecs";

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

export class BooleanEffect extends ValueComponent<BooleanEffectId> {
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

export class Prng extends EcsComponent {
  state: number;
  constructor(seed?: number) {
    super();

    this.state = seed ?? Date.now();
  }

  next(): number {
    return this.mulberry32();
  }

  // https://stackoverflow.com/a/47593316/586472
  private mulberry32(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}
