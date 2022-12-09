import { BooleanEffectId } from "@/app/interfaces";

import { ReadonlyValueComponent, ValueComponent } from "@/app/ecs";

export class Unlocked extends ValueComponent<boolean> {
  constructor(public value: boolean) {
    super();
  }
}

export class UnlockOnEffect extends ReadonlyValueComponent<BooleanEffectId> {}
