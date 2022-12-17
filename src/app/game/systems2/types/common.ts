import { BuildingId, FulfillmentId, ResourceId } from "@/app/interfaces";

import {
  EcsComponent,
  ReadonlyValueComponent,
  ValueComponent,
} from "@/app/ecs";
import { ChoiceSpecification, choose } from "@/app/utils/probability";

export class Level extends ValueComponent<number> {
  constructor() {
    super(0);
  }
}

export class PriceRatio extends ReadonlyValueComponent<number> {}

export class Fulfillment extends ReadonlyValueComponent<FulfillmentId> {}

export class Building extends ReadonlyValueComponent<BuildingId> {}

export class Resource extends ReadonlyValueComponent<ResourceId> {}

export class Prng extends EcsComponent {
  state: number;
  constructor(seed?: number) {
    super();

    this.state = seed ?? Date.now();
  }

  next(): number {
    return this.mulberry32();
  }

  binary(threshold: number): boolean {
    return this.next() < threshold;
  }

  choice<T>(spec: ChoiceSpecification<T>): T {
    return choose(spec, () => this.next());
  }

  // https://stackoverflow.com/a/47593316/586472
  private mulberry32(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}
