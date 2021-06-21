import {
  EnvironmentMetadata,
  IEnvironmentMetadata,
} from "../environment/metadata";
import {
  RecipeId,
  RecipeMetadata,
  RecipeMetadataType,
} from "../workshop/metadata";
import {
  ResourceMetadataType,
  ResourceId,
  ResourceMetadata,
} from "../resources/metadata";

class MetadataPool {
  environment: IEnvironmentMetadata = EnvironmentMetadata;
  resources: Record<ResourceId, ResourceMetadataType> = ResourceMetadata;
  recipes: Record<RecipeId, RecipeMetadataType> = RecipeMetadata;
}

export { MetadataPool };
