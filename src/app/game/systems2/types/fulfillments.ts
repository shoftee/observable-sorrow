import { EcsComponent, ValueComponent } from "@/app/ecs";

import { FulfillmentId, ResourceId } from "@/app/interfaces";

export class Id extends ValueComponent<FulfillmentId> {
  constructor(readonly value: FulfillmentId) {
    super();
  }
}

export class Fulfillment extends EcsComponent {
  fulfilled = false;
  eta: number | undefined;
}

export class Capped extends ValueComponent<boolean> {
  constructor(public value: boolean) {
    super();
  }
}

export class Ingredient extends ValueComponent<ResourceId> {
  constructor(readonly value: ResourceId) {
    super();
  }
}

export class Requirement extends ValueComponent<number> {
  constructor(public value: number) {
    super();
  }
}
