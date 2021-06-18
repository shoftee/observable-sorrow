import { EnvironmentMetadata, IEnvironmentMetadata } from "./environment";
import { LimitMetadata, LimitMetadataType } from "./limits";
import {
  ResourceMetadataType,
  ResourceId,
  ResourceMetadata,
} from "./resources";

class MetadataPool {
  environment: IEnvironmentMetadata = EnvironmentMetadata;
  resources: Record<ResourceId, ResourceMetadataType> = ResourceMetadata;
  limits: Record<ResourceId, LimitMetadataType> = LimitMetadata;
}

export { MetadataPool };
