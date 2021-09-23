import { System } from "../ecs";
import { EntityAdmin } from "../game/entity-admin";
import { ResourceEntity } from "../resources";

export class ResourceProductionSystem extends System {
  constructor(admin: EntityAdmin) {
    super(admin);
  }

  update(): void {
    for (const entity of this.admin.productionEffects()) {
      const resource = this.admin.resource(entity.effect.resourceId);
      resource.state.change = entity.effect.amount;
      if (entity.id == "catnip-field-production") {
        const weatherModifier = this.admin.environment().state.weatherModifier;
        resource.state.change *= 1 + weatherModifier;
      }
    }

    // queue mutations based on delta time
    const delta = this.admin.timers().ticks.delta;
    for (const resource of this.admin.resources()) {
      if (resource.state.change) {
        const change = delta * resource.state.change;
        resource.mutations.give(change);
      }

      this.updateAmount(resource);
    }
  }

  private updateAmount(resource: ResourceEntity): void {
    const currentValue = resource.state.amount;
    const capacity = resource.state.capacity ?? Number.POSITIVE_INFINITY;

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
