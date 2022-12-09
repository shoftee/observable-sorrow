import { DeltaEffectId, LimitEffectId } from "@/app/interfaces";

import {
  EcsComponent,
  MarkerComponent,
  ReadonlyValueComponent,
  ValueComponent,
} from "@/app/ecs";

export class Amount extends ValueComponent<number> {
  value = 0;
}

export class Limit extends ValueComponent<number> {
  value = 0;
}

export class LimitEffect extends ReadonlyValueComponent<LimitEffectId> {}

export class Delta extends ValueComponent<number> {
  value = 0;
}

export class DeltaEffect extends ReadonlyValueComponent<DeltaEffectId> {}

export class LedgerEntry extends EcsComponent {
  debit = 0;
  credit = 0;
}

export class UnlockOnFirstQuantity extends MarkerComponent {}

export class UnlockOnFirstCapacity extends MarkerComponent {}
