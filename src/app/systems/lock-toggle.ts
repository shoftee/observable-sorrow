import { BuildingEntity } from "../buildings";
import { BuildingMetadata, Flag, ResourceMetadata } from "../core/metadata";
import { System } from "../ecs";
import { ResourceEntity } from "../resources";

export class LockToggleSystem extends System {
  update(): void {
    for (const resource of this.admin.resources()) {
      this.updateResourceUnlocked(resource);
    }
    for (const building of this.admin.buildings()) {
      this.updateBuildingUnlocked(building);
    }
  }

  private updateResourceUnlocked(resource: ResourceEntity): boolean {
    if (!resource.state.unlocked && resource.state.amount > 0) {
      resource.state.unlocked = true;
      resource.notifier.mark("unlocked");
      return true;
    } else {
      // some resources re-lock when they are depleted
      if (
        resource.state.unlocked &&
        ResourceMetadata[resource.id].flags[Flag.RelockedWhenDepleted]
      ) {
        resource.state.unlocked = false;
        resource.notifier.mark("unlocked");
        return true;
      }
    }

    return false;
  }

  private updateBuildingUnlocked(building: BuildingEntity): boolean {
    if (!building.state.unlocked) {
      const metadata = BuildingMetadata[building.id];
      for (const requirement of building.price.ingredients) {
        const resource = this.admin.resource(requirement.id);
        const amount = resource.state.amount;
        if (amount >= requirement.amount * metadata.unlockRatio) {
          building.state.unlocked = true;
          building.notifier.mark("unlocked");
          return true;
        }
      }
    }

    return false;
  }
}
