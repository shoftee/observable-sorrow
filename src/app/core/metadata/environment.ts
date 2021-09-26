import { SeasonId } from "./_id";

type SeasonMetadataType = {
  id: SeasonId;
  label: string;
};

export const SeasonsMetadata: Record<SeasonId, SeasonMetadataType> = {
  spring: {
    id: "spring",
    label: "environment.seasons.spring.label",
  },
  summer: {
    id: "summer",
    label: "environment.seasons.summer.label",
  },
  autumn: {
    id: "autumn",
    label: "environment.seasons.autumn.label",
  },
  winter: {
    id: "winter",
    label: "environment.seasons.winter.label",
  },
};
