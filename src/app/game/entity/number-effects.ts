import { NumberEffectId } from "@/app/interfaces";

import { EntityPool, NumberExprs, ValueEntity, Watched, Watcher } from ".";

export class NumberEffectEntity
  extends ValueEntity<NumberEffectId, number>
  implements Watched
{
  constructor(readonly id: NumberEffectId) {
    super(id);
  }
}

export class NumberEffectsPool extends EntityPool<
  NumberEffectId,
  NumberEffectEntity
> {
  constructor(watcher: Watcher) {
    super("numbers", watcher);

    const ids = Object.keys(NumberExprs) as NumberEffectId[];

    for (const id of ids) {
      this.add(new NumberEffectEntity(id));
    }
  }
}
