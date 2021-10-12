import { Flag, UnlockMode } from "@/_state";

import { ResourceEntity, BuildingEntity } from "../entity";
import { System } from ".";

export class LockToggleSystem extends System {
  update(): void {
    for (const resource of this.admin.resources()) {
      this.updateResourceUnlocked(resource);
    }
    for (const building of this.admin.buildings()) {
      this.updateBuildingUnlocked(building);
    }

    const kittens = this.admin.resource("kittens");
    if (kittens.state.capacity && kittens.state.capacity > 0) {
      const population = this.admin.society();
      population.state.unlocked = true;
    }
  }

  private updateResourceUnlocked(resource: ResourceEntity): void {
    const state = resource.state;
    const meta = resource.meta;
    if (!state.unlocked) {
      const unlockMode = meta.unlockMode ?? UnlockMode.FirstQuantity;
      switch (unlockMode) {
        case UnlockMode.FirstQuantity:
          if (state.amount > 0) state.unlocked = true;
          break;
        case UnlockMode.FirstCapacity:
          if (state.capacity && state.capacity > 0) state.unlocked = true;
          break;
      }
    } else {
      // some resources re-lock when they are depleted
      if (state.unlocked && meta.flags[Flag.RelockWhenDepleted]) {
        state.unlocked = false;
      }
    }
  }

  private updateBuildingUnlocked(building: BuildingEntity): void {
    if (!building.state.unlocked) {
      for (const ingredient of building.state.ingredients) {
        const unlockThreshold =
          ingredient.requirement * building.meta.unlockRatio;
        if (ingredient.fulfillment >= unlockThreshold) {
          building.state.unlocked = true;
          return;
        }
      }
    }
  }
}
