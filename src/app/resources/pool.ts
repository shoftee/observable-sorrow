import { EntityPool } from "../ecs";
import { ResourceEntity } from "./entity";
import { ResourceId } from "./metadata";

export class ResourcePool extends EntityPool<ResourceId, ResourceEntity> {
  readonly id = "resource-pool";
}
