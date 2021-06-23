import { EntityPool, IUpdate } from "../ecs";
import { ResourceEntity } from "./entity";
import { ResourceId, ResourceMetadata } from "../core/metadata/resources";

export class ResourcePool
  extends EntityPool<ResourceId, ResourceEntity>
  implements IUpdate
{
  constructor() {
    super();
    for (const item of Object.values(ResourceMetadata)) {
      const entity = new ResourceEntity(item);
      this.set(item.id, entity);
    }
  }

  update(dt: number): void {
    for (const iterator of this.all()) {
      iterator.update(dt);
    }
  }
}
