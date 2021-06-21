import { EntityPool, IUpdate } from "../ecs";
import { ResourceEntity } from "./entity";
import { ResourceId, ResourceMetadata, ResourceMetadataType } from "./metadata";

export class ResourcePool
  extends EntityPool<ResourceId, ResourceEntity>
  implements IUpdate
{
  readonly id = "resource-pool";

  private readonly metadata: Record<ResourceId, ResourceMetadataType>;

  constructor() {
    super();
    this.metadata = ResourceMetadata;
    for (const item of Object.values(this.metadata)) {
      const entity = new ResourceEntity(item);
      this.set(item.id, entity);
    }
  }

  update(deltaTime: number): void {
    for (const iterator of this.all()) {
      iterator.update(deltaTime);
    }
  }
}
