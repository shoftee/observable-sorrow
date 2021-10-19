import { reactive } from "vue";

import { EffectId } from "@/app/interfaces";
import { fromObject } from "@/app/utils/enumerable";

import { Entity, EntityPool, Expr, Exprs, Watcher } from ".";

export class EffectEntity extends Entity<EffectId> {
  readonly state: { value?: number };

  constructor(readonly id: EffectId, readonly expr: Expr) {
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

export class EffectsPool extends EntityPool<EffectId, EffectEntity> {
  constructor(watcher: Watcher) {
    super("effects", watcher);
    for (const [id, expr] of fromObject<EffectId, Expr>(Exprs)) {
      this.add(new EffectEntity(id, expr));
    }
  }
}
