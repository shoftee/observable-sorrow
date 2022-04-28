import {
  BuildingId,
  JobId,
  NumberEffectId,
  ResourceId,
  SeasonId,
  SectionId,
  TechId,
  WeatherId,
} from "@/app/interfaces";
import {
  BonfireItemId,
  BonfireItems,
  BuildingMetadata,
  BuildingMetadataType,
  EffectDisplayStyles,
  JobMetadata,
  JobMetadataType,
  EffectDisplayStyle,
  RecipeMetadata,
  RecipeMetadataType,
  ResourceMetadata,
  ResourceMetadataType,
  SeasonMetadataType,
  SeasonsMetadata,
  SectionMetadataType,
  SectionsMetadata,
  TechMetadata,
  TechMetadataType,
  WeatherMetadata,
  WeatherMetadataType,
} from "@/app/state";
import { Enumerable } from "@/app/utils/enumerable";

export const Meta = {
  bonfireItems(): Enumerable<BonfireItemId> {
    return new Enumerable(BonfireItems);
  },

  buildings(): Enumerable<BuildingMetadataType> {
    return new Enumerable(Object.values(BuildingMetadata));
  },

  building(id: BuildingId): BuildingMetadataType {
    return BuildingMetadata[id];
  },

  effectDisplay(id: NumberEffectId): EffectDisplayStyle {
    return EffectDisplayStyles[id];
  },

  jobs(): Enumerable<JobMetadataType> {
    return new Enumerable(Object.values(JobMetadata));
  },

  job(id: JobId): JobMetadataType {
    return JobMetadata[id];
  },

  recipes(): Enumerable<RecipeMetadataType> {
    return new Enumerable(Object.values(RecipeMetadata));
  },

  resources(): Enumerable<ResourceMetadataType> {
    return new Enumerable(Object.values(ResourceMetadata));
  },

  resource(id: ResourceId): ResourceMetadataType {
    return ResourceMetadata[id];
  },

  season(id: SeasonId): SeasonMetadataType {
    return SeasonsMetadata[id];
  },

  sections(): Enumerable<SectionMetadataType> {
    return new Enumerable(Object.values(SectionsMetadata));
  },

  section(id: SectionId): SectionMetadataType {
    return SectionsMetadata[id];
  },

  techs(): Enumerable<TechMetadataType> {
    return new Enumerable(Object.values(TechMetadata));
  },

  tech(id: TechId): TechMetadataType {
    return TechMetadata[id];
  },

  weather(id: WeatherId): WeatherMetadataType {
    return WeatherMetadata[id];
  },
};
