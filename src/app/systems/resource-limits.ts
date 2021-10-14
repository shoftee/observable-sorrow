import { System } from ".";
import { EntityAdmin } from "../entity";

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
      const meta = resource.meta;
      const limitEffect = meta.effects.limit;
      if (limitEffect) {
        resource.state.capacity = this.admin.effect(limitEffect).get();
      }
    }
  }
}
