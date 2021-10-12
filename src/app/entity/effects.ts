import { reactive } from "vue";

import { EffectId } from "@/_interfaces";

import { Entity, EntityPool, EntityWatcher, Expr, Exprs, Watch } from ".";
import { fromObject } from "@/_utils/enumerable";

export class EffectEntity extends Entity<EffectId> {
  readonly state: { value?: number };

  constructor(readonly id: EffectId, readonly expr: Expr) {
    super(id);
    this.state = reactive({ value: undefined });
  }

  acceptWatcher(watcher: Watch): void {
    watcher(this.id, this.state);
  }

  get(): number | undefined {
    return this.state.value;
  }

  set(value: number | undefined): void {
    this.state.value = value;
  }
}

export class EffectsPool extends EntityPool<EffectId, EffectEntity> {
  constructor(watcher: EntityWatcher) {
    super("effects", watcher);
    for (const [id, expr] of fromObject<EffectId, Expr>(Exprs)) {
      this.add(new EffectEntity(id, expr));
    }
  }
}
