import { reactive } from "vue";

import { NumberEffectId } from "@/app/interfaces";
import { NumberEffectState } from "@/app/state";
import { fromObject } from "@/app/utils/enumerable";

import { Entity, EntityPool, NumberExpr, NumberExprs, Watcher } from ".";

export class NumberEffectEntity extends Entity<NumberEffectId> {
  readonly state: NumberEffectState;

  constructor(readonly id: NumberEffectId, readonly expr: NumberExpr) {
    super(id);
    this.state = reactive({ value: undefined });
  }

  watch(watcher: Watcher): void {
    watcher.watch(this.id, this.state);
  }

  get(): number | undefined {
    return this.state.value;
  }

  set(value: number | undefined): void {
    this.state.value = value;
  }
}

export class NumberEffectsPool extends EntityPool<
  NumberEffectId,
  NumberEffectEntity
> {
  constructor(watcher: Watcher) {
    super("numbers", watcher);
    for (const [id, expr] of fromObject<NumberEffectId, NumberExpr>(
      NumberExprs,
    )) {
      this.add(new NumberEffectEntity(id, expr));
    }
  }
}
