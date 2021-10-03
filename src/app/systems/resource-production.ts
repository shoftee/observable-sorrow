import { System } from "@/_ecs";
import { ResourceMetadata } from "@/_state";

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
      if (resource.state.change) {
        // calculate new amounts based on fractional ticks
        const change = dt * resource.state.change;

        if (change > 0) {
          resource.delta.addDebit(change);
        } else if (change < 0) {
          // change is negative, add abs to credit
          resource.delta.addCredit(Math.abs(change));
        }
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
    const capacity = resource.state.capacity ?? Number.POSITIVE_INFINITY;

    // subtract losses first
    let newValue = currentValue - resource.delta.credit;
    if (newValue < capacity) {
      // new resources are gained only when under capacity
      newValue = newValue + resource.delta.debit;
      // but they only go up to capacity at most
      newValue = Math.min(newValue, capacity);
    }

    // negative resource amount is non-sense (for now)
    newValue = Math.max(newValue, 0);

    // set newly calculated value
    resource.state.amount = newValue;

    // clear delta
    resource.delta.reset();
  }
}
