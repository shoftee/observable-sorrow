import { EffectId } from "@/_interfaces";
import { System } from "../ecs";
import { EffectExpressions } from "../core/metadata";
import { EffectPoolEntity } from "../effects";

export class EffectsSystem extends System {
  init(): void {
    this.calculateEffects();
  }

  update(): void {
    this.calculateEffects();
  }

  private calculateEffects() {
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
