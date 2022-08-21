import { ValueComponent } from "@/app/ecs";
import { BooleanEffectId } from "@/app/interfaces";

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
