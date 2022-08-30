import { BooleanEffectId } from "@/app/interfaces";

import { ValueComponent } from "@/app/ecs";

export class Unlocked extends ValueComponent<boolean> {
  constructor(public value: boolean) {
    super();
  }
}

export class UnlockOnEffect extends ValueComponent<BooleanEffectId> {
  constructor(readonly value: BooleanEffectId) {
    super();
  }
}
