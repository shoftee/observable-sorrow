import { BuildingMetadata, EffectMetadata, ValueKind } from "../core/metadata";

import { System } from "../ecs";
import { EntityAdmin } from "../game/entity-admin";

export class BuildingEffectsSystem extends System {
  constructor(admin: EntityAdmin) {
    super(admin);
  }

  init(): void {
    for (const building of this.admin.buildings()) {
      const meta = BuildingMetadata[building.id];
      building.state.effects.set(meta.effects.count, 0);

      for (const effect of meta.effects.resources) {
        const baseValue = EffectMetadata[effect.per].value;
        if (baseValue.kind === ValueKind.Base) {
          building.state.effects.set(effect.per, baseValue.value);
        }
      }

      building.changes.mark("effects");
    }
  }

  update(): void {
    // recalculate production effects from buildings
    const effects = this.admin.effects();
    for (const building of this.admin.buildings()) {
      const meta = BuildingMetadata[building.id];

      effects.set(meta.effects.count, building.state.level);
      if (effects.changes.has(meta.effects.count)) {
        building.changes.mark("effects");
      }
    }
  }
}
