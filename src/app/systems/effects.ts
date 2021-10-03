import { EffectId } from "@/_interfaces";
import { EffectExpressions, ExprValueStore, Resolver } from "@/_state";

import { System } from ".";
import { EntityAdmin } from "../entity";

export class EffectsSystem extends System {
  private readonly store: Store;

  constructor(admin: EntityAdmin) {
    super(admin);
    this.store = new Store(this.admin);
  }

  init(): void {
    this.resolveEffectValues();
  }

  update(): void {
    // recalculate production effects from buildings
    for (const building of this.admin.buildings()) {
      this.admin.effect(building.meta.effects.count).set(building.state.level);
    }

    this.resolveEffectValues();
  }

  private resolveEffectValues() {
    const resolver = new Resolver();
    resolver.resolveExprs(this.store, EffectExpressions.values());
  }
}

class Store implements ExprValueStore {
  constructor(private readonly admin: EntityAdmin) {}

  get(id: string): number | undefined {
    return this.admin.effect(id as EffectId)?.get();
  }

  set(id: string, val: number | undefined): void {
    this.admin.effect(id as EffectId)?.set(val);
  }
}
