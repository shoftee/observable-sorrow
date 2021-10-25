import { reactive } from "vue";

import { BooleanEffectId } from "@/app/interfaces";
import { BooleanEffectState } from "@/app/state";
import { fromObject } from "@/app/utils/enumerable";

import {
  Entity,
  EntityPool,
  BooleanExpr,
  BooleanExprs,
  Watcher,
  Watched,
} from ".";

export class BooleanEffectEntity
  extends Entity<BooleanEffectId>
  implements Watched
{
  readonly state: BooleanEffectState;

  constructor(readonly id: BooleanEffectId, readonly expr: BooleanExpr) {
    super(id);
    this.state = reactive({ value: undefined });
  }

  watch(watcher: Watcher): void {
    watcher.watch(this.id, this.state);
  }

  get(): boolean | undefined {
    return this.state.value;
  }

  set(value: boolean | undefined): void {
    this.state.value = value;
  }
}

export class BooleanEffectsPool extends EntityPool<
  BooleanEffectId,
  BooleanEffectEntity
> {
  constructor(watcher: Watcher) {
    super("booleans", watcher);
    for (const [id, expr] of fromObject<BooleanEffectId, BooleanExpr>(
      BooleanExprs,
    )) {
      this.add(new BooleanEffectEntity(id, expr));
    }
  }
}
