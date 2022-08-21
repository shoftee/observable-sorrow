import { EcsComponent, ValueComponent } from "@/app/ecs";

import { BuildingId, RecipeId, ResourceId } from "@/app/interfaces";

export class Recipe extends ValueComponent<RecipeId> {
  constructor(readonly value: RecipeId) {
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

export class Fulfillment extends EcsComponent {
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

export class UnlockOnPriceRatio extends ValueComponent<number> {
  constructor(readonly value: number) {
    super();
  }
}
