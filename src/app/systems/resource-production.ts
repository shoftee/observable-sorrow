import { ResourceMetadata } from "@/_state";

import { System } from "../ecs";
import { EntityAdmin } from "../game/entity-admin";
import { ResourceEntity } from "../resources";

export class ResourceProductionSystem extends System {
  constructor(admin: EntityAdmin) {
    super(admin);
  }

  init(): void {
    this.updateEffectValues();
  }

  update(): void {
    this.updateEffectValues();

    const dt = this.admin.timers().ticks.delta;
    for (const resource of this.admin.resources()) {
      if (
        resource.state.change &&
        resource.state.amount < resource.state.effectiveCapacity
      ) {
        // calculate new amounts based on fractional ticks
        const change = dt * resource.state.change;
        resource.mutations.give(change);
      }

      this.updateAmount(resource);
    }
  }

  private updateEffectValues() {
    for (const resource of this.admin.resources()) {
      const meta = ResourceMetadata[resource.id];

      const limitEffect = meta.limitEffect;
      resource.state.capacity = this.admin.effects().get(limitEffect);

      const productionEffect = meta.productionEffect;
      resource.state.change = this.admin.effects().get(productionEffect) ?? 0;
    }
  }

  private updateAmount(resource: ResourceEntity): void {
    const currentValue = resource.state.amount;
    const capacity = resource.state.effectiveCapacity;

    // calculate delta from mutations
    const delta = resource.mutations.sum();

    // determine new value, truncate
    let newValue = currentValue + delta;
    newValue = Math.max(newValue, 0);
    newValue = Math.min(newValue, capacity);

    // set newly calculated value
    resource.state.amount = newValue;
  }
}
