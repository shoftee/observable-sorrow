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
      const metadata = BuildingMetadata[building.id];
      for (const [id, amount] of building.state.ingredients) {
        const resource = this.admin.resource(id);
        if (resource.state.amount >= amount * metadata.unlockRatio) {
          building.state.unlocked = true;
          return;
        }
      }
    }
  }
}
