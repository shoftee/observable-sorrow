import { BuildingId, ResourceId, SeasonId, WeatherId } from "@/app/interfaces";
import {
  BonfireMetadata,
  BonfireMetadataType,
  BuildingMetadata,
  BuildingMetadataType,
  JobMetadata,
  JobMetadataType,
  RecipeMetadata,
  RecipeMetadataType,
  ResourceMetadata,
  ResourceMetadataType,
  SeasonMetadataType,
  SeasonsMetadata,
  WeatherMetadata,
  WeatherMetadataType,
} from "@/app/state";
import { asEnumerable, Enumerable } from "@/app/utils/enumerable";

export const Meta = {
  bonfireItems(): Enumerable<BonfireMetadataType> {
    return asEnumerable(Object.values(BonfireMetadata));
  },

  buildings(): Enumerable<BuildingMetadataType> {
    return asEnumerable(Object.values(BuildingMetadata));
  },

  building(id: BuildingId): BuildingMetadataType {
    return BuildingMetadata[id];
  },

  jobs(): Enumerable<JobMetadataType> {
    return asEnumerable(Object.values(JobMetadata));
  },

  recipes(): Enumerable<RecipeMetadataType> {
    return asEnumerable(Object.values(RecipeMetadata));
  },

  resources(): Enumerable<ResourceMetadataType> {
    return asEnumerable(Object.values(ResourceMetadata));
  },

  resource(id: ResourceId): ResourceMetadataType {
    return ResourceMetadata[id];
  },

  season(id: SeasonId): SeasonMetadataType {
    return SeasonsMetadata[id];
  },

  weather(id: WeatherId): WeatherMetadataType {
    return WeatherMetadata[id];
  },
};
