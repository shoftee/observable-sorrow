import { Flag, ResourceMetadata } from "@/_state";

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
  }

  private updateResourceUnlocked(resource: ResourceEntity): void {
    if (!resource.state.unlocked && resource.state.amount > 0) {
      resource.state.unlocked = true;
    } else {
      // some resources re-lock when they are depleted
      if (
        resource.state.unlocked &&
        ResourceMetadata[resource.id].flags[Flag.RelockedWhenDepleted]
      ) {
        resource.state.unlocked = false;
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
