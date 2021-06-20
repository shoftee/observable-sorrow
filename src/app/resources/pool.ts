import { EntityPool, IInit, IUpdate } from "../ecs";
import { ResourceEntity } from "./entity";
import { ResourceId, ResourceMetadata, ResourceMetadataType } from "./metadata";

export class ResourcePoolEntity
  extends EntityPool<ResourceId, ResourceEntity>
  implements IInit, IUpdate
{
  readonly id = "resource-pool";

  private metadata!: Record<ResourceId, ResourceMetadataType>;

  init(): void {
    this.metadata = ResourceMetadata;
    for (const item of Object.values(this.metadata)) {
      const entity = new ResourceEntity(item);
      entity.init();
      this.set(item.id, entity);
    }
  }

  update(deltaTime: number): void {
    for (const iterator of this.all()) {
      iterator.update(deltaTime);
    }
  }
}
