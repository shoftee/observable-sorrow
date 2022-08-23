import { LimitEffectId } from "@/app/interfaces";

import { EcsComponent, ValueComponent } from "@/app/ecs";

export class Amount extends ValueComponent<number> {
  value = 0;
}

export class Capacity extends ValueComponent<number> {
  value = 0;
  constructor(readonly effect: LimitEffectId) {
    super();
  }
}

export class LedgerEntry extends EcsComponent {
  debit = 0;
  credit = 0;
}

export class UnlockOnFirstQuantity extends EcsComponent {}

export class UnlockOnFirstCapacity extends EcsComponent {}
