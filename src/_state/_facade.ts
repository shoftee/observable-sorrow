import { BuildingId, ResourceId, SeasonId, WeatherId } from "@/_interfaces";
import {
  BonfireMetadata,
  BonfireMetadataType,
  BuildingMetadata,
  BuildingMetadataType,
  RecipeMetadata,
  RecipeMetadataType,
  ResourceMetadata,
  ResourceMetadataType,
  SeasonMetadataType,
  SeasonsMetadata,
  WeatherMetadata,
  WeatherMetadataType,
} from "@/_state";
import { asEnumerable, Enumerable } from "@/_utils/enumerable";

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
