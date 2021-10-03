import { EffectId } from "@/_interfaces";
import { EffectExpressions } from "@/_state";

import { EffectPoolEntity } from "../entity";

import { System } from ".";

export class EffectsSystem extends System {
  init(): void {
    this.resolveEffectValues();
  }

  update(): void {
    // recalculate production effects from buildings
    const effects = this.admin.effects();
    for (const building of this.admin.buildings()) {
      effects.set(building.meta.effects.count, building.state.level);
    }

    this.resolveEffectValues();
  }

  private resolveEffectValues() {
    const effects = this.admin.effects();
    const resolved = new Set<EffectId>();
    for (const id of Object.keys(EffectExpressions)) {
      this.resolveEffect(effects, resolved, id as EffectId);
    }
  }

  private resolveEffect(
    values: EffectPoolEntity,
    resolved: Set<EffectId>,
    id: EffectId,
  ) {
    if (resolved.has(id)) {
      return;
    }

    resolved.add(id);

    const effectValue = EffectExpressions[id];
    if (effectValue) {
      for (const dep of effectValue.deps()) {
        this.resolveEffect(values, resolved, dep);
      }
      const calculated = effectValue.resolve(values);
      values.set(id, calculated);
    }
  }
}
