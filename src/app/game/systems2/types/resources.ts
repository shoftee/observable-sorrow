import { EcsComponent } from "@/app/ecs";
import { ResourceId } from "@/app/interfaces";

export class Id extends EcsComponent {
  constructor(readonly id: ResourceId) {
    super();
  }
}

export class Amount extends EcsComponent {
  value = 0;
}

export class Delta extends EcsComponent {
  value = 0;
}

export class Capacity extends EcsComponent {
  value = 0;
}

export class LedgerEntry extends EcsComponent {
  debit = 0;
  credit = 0;
}
