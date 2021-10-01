import { BuildingMetadata } from "@/_state";

import { System } from "../ecs";
import { EntityAdmin } from "../game/entity-admin";

export class BuildingEffectsSystem extends System {
  constructor(admin: EntityAdmin) {
    super(admin);
  }

  update(): void {
    // recalculate production effects from buildings
    const effects = this.admin.effects();
    for (const building of this.admin.buildings()) {
      const meta = BuildingMetadata[building.id];
      effects.set(meta.effects.count, building.state.level);
    }
  }
}
