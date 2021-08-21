import { BuildingMetadata, ProductionEffectMetadata } from "../core/metadata";

import { System } from "../ecs";
import { EntityAdmin } from "../game/entity-admin";

export class ProductionSystem extends System {
  constructor(admin: EntityAdmin) {
    super(admin);
  }

  update(_dt: number): void {
    // recalculate production effects from buildings
    for (const building of this.admin.buildings()) {
      const level = building.state.level;
      const buildingMetadata = BuildingMetadata[building.id];
      for (const effectId of buildingMetadata.effects.production) {
        const metadata = ProductionEffectMetadata[effectId];
        const entity = this.admin.productionEffect(effectId);
        const calculatedAmount = level * metadata.amount;
        if (entity.effect.amount !== calculatedAmount) {
          entity.effect.amount = calculatedAmount;
          entity.notifier.mark("amount");
        }
      }
    }

    for (const entity of this.admin.productionEffects()) {
      const resource = this.admin.resource(entity.effect.resourceId);
      resource.state.change = entity.effect.amount;
      resource.notifier.mark("change");
    }

    // queue mutations based on delta time
    const delta = this.admin.timers().ticks.delta;
    for (const resource of this.admin.resources()) {
      if (resource.state.change) {
        const change = delta * resource.state.change;
        resource.mutations.give(change);
      }
    }
  }
}
