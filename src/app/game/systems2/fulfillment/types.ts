import { FulfillmentId, ResourceId } from "@/app/interfaces";

import { EcsComponent, ValueComponent } from "@/app/ecs";

import { Fulfillment, Resource } from "../types/common";

export class Progress extends EcsComponent {
  fulfilled = false;
  eta: number | undefined;
}

export class Capped extends ValueComponent<boolean> {
  constructor(public value: boolean) {
    super();
  }
}

export class Requirement extends ValueComponent<number> {
  constructor(public value: number) {
    super();
  }
}

export class BaseRequirement extends ValueComponent<number> {
  constructor(public value: number) {
    super();
  }
}

export function* fulfillmentComponents(id: FulfillmentId) {
  yield new Fulfillment(id);
  yield new Progress();
  yield new Capped(false);
}

export function* ingredientComponents(id: ResourceId, requirement: number) {
  yield new Resource(id);
  yield new Requirement(requirement);
  yield new Progress();
  yield new Capped(false);
}
