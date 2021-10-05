import { BuildingId, ResourceId, SeasonId, WeatherId } from "@/_interfaces";
import {
  BonfireMetadata,
  BonfireMetadataType,
  BuildingMetadata,
  BuildingMetadataType,
  ResourceMetadata,
  ResourceMetadataType,
  SeasonMetadataType,
  SeasonsMetadata,
  WeatherMetadata,
  WeatherMetadataType,
} from "@/_state";
import { Enumerable } from "@/_utils/enumerable";

class AllMetadata {
  bonfireItems(): Enumerable<BonfireMetadataType> {
    const values = Object.values(BonfireMetadata);
    return Enumerable.fromIterable(values);
  }

  buildings(): Enumerable<BuildingMetadataType> {
    const values = Object.values(BuildingMetadata);
    return Enumerable.fromIterable(values);
  }

  building(id: BuildingId): BuildingMetadataType {
    return BuildingMetadata[id];
  }

  resources(): Enumerable<ResourceMetadataType> {
    const values = Object.values(ResourceMetadata);
    return Enumerable.fromIterable(values);
  }

  resource(id: ResourceId): ResourceMetadataType {
    return ResourceMetadata[id];
  }

  season(id: SeasonId): SeasonMetadataType {
    return SeasonsMetadata[id];
  }

  weather(id: WeatherId): WeatherMetadataType {
    return WeatherMetadata[id];
  }
}

export const Meta = new AllMetadata();
