import { EcsComponent, ValueComponent } from "@/app/ecs";
import { ResourceId } from "@/app/interfaces";

export class Id extends ValueComponent<ResourceId> {
  constructor(readonly value: ResourceId) {
    super();
  }
}

export class Amount extends ValueComponent<number> {
  value = 0;
}

export class Capacity extends ValueComponent<number> {
  value = 0;
}

export class LedgerEntry extends EcsComponent {
  debit = 0;
  credit = 0;
}

export class UnlockOnFirstQuantity extends EcsComponent {}

export class UnlockOnFirstCapacity extends EcsComponent {}
