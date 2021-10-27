import { BooleanEffectId } from "@/app/interfaces";

import { EntityPool, BooleanExprs, Watcher, Watched, ValueEntity } from ".";

export class BooleanEffectEntity
  extends ValueEntity<BooleanEffectId, boolean>
  implements Watched
{
  constructor(readonly id: BooleanEffectId) {
    super(id);
  }
}

export class BooleanEffectsPool extends EntityPool<
  BooleanEffectId,
  BooleanEffectEntity
> {
  constructor(watcher: Watcher) {
    super("booleans", watcher);

    const ids = Object.keys(BooleanExprs) as BooleanEffectId[];

    for (const id of ids) {
      this.add(new BooleanEffectEntity(id));
    }
  }
}
