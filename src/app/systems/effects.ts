import { System } from "../ecs";
import { EffectId, EffectMetadata, ValueKind } from "../core/metadata";

import { EffectPoolEntity } from "../effects";

type EffectBits = Partial<{ [Id in EffectId]: boolean }>;

export class EffectsSystem extends System {
  init(): void {
    this.updateCompoundEffects(true);
  }

  update(): void {
    this.updateCompoundEffects();
  }

  private updateCompoundEffects(force: boolean = false) {
    const effects = this.admin.effects();
    const resolved: EffectBits = {};
    for (const effect of Object.values(EffectMetadata)) {
      this.updateCompoundEffect(effect.id, effects, resolved, force);
    }
  }

  private updateCompoundEffect(
    id: EffectId,
    entity: EffectPoolEntity,
    resolved: EffectBits,
    force: boolean,
  ) {
    if (resolved[id] === true) {
      return;
    }

    resolved[id] = true;

    const metadata = EffectMetadata[id];
    if (metadata.value.kind === ValueKind.Base) {
      entity.set(id, metadata.value.value);
      return;
    } else if (metadata.value.kind !== ValueKind.Compound) {
      return;
    }

    let calculation = 0;
    for (const modifier of metadata.value.effects) {
      if (resolved[modifier.id] !== true) {
        this.updateCompoundEffect(modifier.id, entity, resolved, force);
      }

      const dependencyValue = entity.get(modifier.id) ?? 0;
      calculation = modifier.apply(calculation, dependencyValue);
    }

    entity.set(metadata.id, calculation);

    return;
  }
}
