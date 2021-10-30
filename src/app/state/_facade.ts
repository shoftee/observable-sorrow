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
  BonfireMetadata,
  BonfireMetadataType,
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

  effectDisplay(id: NumberEffectId): EffectDisplayStyle {
    return EffectDisplayStyles[id];
  },

  jobs(): Enumerable<JobMetadataType> {
    return asEnumerable(Object.values(JobMetadata));
  },

  job(id: JobId): JobMetadataType {
    return JobMetadata[id];
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

  sections(): Enumerable<SectionMetadataType> {
    return asEnumerable(Object.values(SectionsMetadata));
  },

  section(id: SectionId): SectionMetadataType {
    return SectionsMetadata[id];
  },

  techs(): Enumerable<TechMetadataType> {
    return asEnumerable(Object.values(TechMetadata));
  },

  tech(id: TechId): TechMetadataType {
    return TechMetadata[id];
  },

  weather(id: WeatherId): WeatherMetadataType {
    return WeatherMetadata[id];
  },
};
