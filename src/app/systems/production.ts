import { ResourceId } from "../core/metadata";

import { System } from "../ecs";
import { TimerComponent } from "../ecs/common";
import { EntityAdmin } from "../game/entity-admin";

import { ResourceEntity } from "../resources";

export class ProductionSystem extends System {
  constructor(admin: EntityAdmin) {
    super(admin);
  }

  private get ticks(): TimerComponent {
    return this.admin.timers().ticks;
  }

  private resource(id: ResourceId): ResourceEntity {
    return this.admin.resource(id);
  }

  update(_dt: number): void {
    // recalculate production effects from buildings
    for (const building of this.admin.buildings()) {
      const level = building.state.level;
      for (const effect of building.effects.production) {
        const effectAmount = level * effect.amount;
        const resource = this.resource(effect.resourceId);
        if (resource.state.change !== effectAmount) {
          resource.state.change = effectAmount;
          resource.notifier.mark("change");
        }
      }
    }

    // queue mutations based on delta time
    const delta = this.ticks.delta;
    for (const resource of this.admin.resources()) {
      if (resource.state.change) {
        const change = delta * resource.state.change;
        resource.mutations.give(change);
      }
    }
  }
}
