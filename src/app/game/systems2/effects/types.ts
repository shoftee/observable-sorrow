import { NumberEffectId } from "@/app/interfaces";

import { EcsComponent } from "@/app/ecs";
import { ChangeTrackers, Extract, MapQuery, Tracker } from "@/app/ecs/query";

export class NumberEffect extends EcsComponent {
  constructor(readonly id: NumberEffectId, public value?: number) {
    super();
  }
}

export const NumberTrackersQuery = MapQuery<
  NumberEffectId,
  Tracker<NumberEffect>
>(
  Extract(NumberEffect, (c) => c.id),
  ChangeTrackers(NumberEffect),
);
