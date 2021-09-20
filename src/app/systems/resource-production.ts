import { System } from "../ecs";
import { EntityAdmin } from "../game/entity-admin";

export class ResourceProductionSystem extends System {
  constructor(admin: EntityAdmin) {
    super(admin);
  }

  update(): void {
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
