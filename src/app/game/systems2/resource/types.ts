import { DeltaEffectId, LimitEffectId } from "@/app/interfaces";

import { EcsComponent, ValueComponent } from "@/app/ecs";

export class Amount extends ValueComponent<number> {
  value = 0;
}

export class Limit extends ValueComponent<number> {
  value = 0;
}

export class LimitEffect extends ValueComponent<LimitEffectId> {
  constructor(readonly value: LimitEffectId) {
    super();
  }
}

export class Delta extends ValueComponent<number> {
  value = 0;
}

export class DeltaEffect extends ValueComponent<DeltaEffectId> {
  constructor(readonly value: DeltaEffectId) {
    super();
  }
}

export class LedgerEntry extends EcsComponent {
  debit = 0;
  credit = 0;
}

export class UnlockOnFirstQuantity extends EcsComponent {}

export class UnlockOnFirstCapacity extends EcsComponent {}
