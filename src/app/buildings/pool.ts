import { BuildingId, BuildingMetadata } from "../core/metadata";
import { EntityPool, IUpdate } from "../ecs";
import { ResourcePool } from "../resources";
import { BuildingEntity } from "./entity";

export class BuildingPool
  extends EntityPool<BuildingId, BuildingEntity>
  implements IUpdate
{
  constructor(private readonly resources: ResourcePool) {
    super();

    for (const item of Object.values(BuildingMetadata)) {
      const entity = new BuildingEntity(resources, item);
      this.set(item.id, entity);
    }
  }

  update(dt: number): void {
    for (const building of this.all()) {
      building.update(dt);
    }
  }

  buy(id: BuildingId): void {
    if (this.canBuild(id)) {
      const building = this.get(id);
      for (const ingredient of BuildingMetadata[id].ingredients) {
        const resource = this.resources.get(ingredient.id);
        resource.mutations.take(ingredient.amount);
      }
      building.buildQueue.construct();
    } else {
      // ?????
    }
  }

  private canBuild(id: BuildingId) {
    for (const ingredient of BuildingMetadata[id].ingredients) {
      const resource = this.resources.get(ingredient.id);
      if (resource.state.amount < ingredient.amount) {
        return false;
      }
    }
    return true;
  }
}
