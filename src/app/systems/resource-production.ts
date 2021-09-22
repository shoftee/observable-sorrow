import { System } from "../ecs";
import { EntityAdmin } from "../game/entity-admin";

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
    }
  }
}
