import { NumberEffectId } from "@/app/interfaces";

import { EcsComponent } from "@/app/ecs";

export class NumberEffect extends EcsComponent {
  constructor(readonly id: NumberEffectId, readonly value?: number) {
    super();
  }
}
