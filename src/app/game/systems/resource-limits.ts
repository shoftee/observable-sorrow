import { EntityAdmin } from "../entity";

import { System } from ".";

export class ResourceLimitsSystem extends System {
  constructor(admin: EntityAdmin) {
    super(admin);
  }

  init(): void {
    this.updateLimits();
  }

  update(): void {
    this.updateLimits();
  }

  private updateLimits() {
    for (const resource of this.admin.resources()) {
      const limitEffect = resource.meta.effects.limit;
      if (limitEffect) {
        resource.state.capacity = this.admin.effect(limitEffect).get();
      }
    }
  }
}
