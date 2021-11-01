import { watchSyncEffect } from "vue";

import { EntityAdmin } from "../entity";

import { System } from ".";

export class ResourceLimitsSystem extends System {
  constructor(admin: EntityAdmin) {
    super(admin);
  }

  init(): void {
    watchSyncEffect(() => {
      for (const { state, meta } of this.admin.resources()) {
        const limitEffect = meta.effects.limit;
        if (limitEffect) {
          state.capacity = this.admin.number(limitEffect).get();
        }
      }
    });
  }

  update(): void {
    // limits are fully reactive
    return;
  }
}
