import { BooleanEffectId } from "@/app/interfaces";

import { ReadonlyValueComponent, ValueComponent } from "@/app/ecs";

export class Unlocked extends ValueComponent<boolean> {}

export class UnlockOnEffect extends ReadonlyValueComponent<BooleanEffectId> {}
