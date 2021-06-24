export type SeasonId = "spring" | "summer" | "autumn" | "winter";

type SeasonMetadataType = {
  id: SeasonId;
  label: string;
};

export interface EnvironmentMetadataType {
  seasons: Record<SeasonId, SeasonMetadataType>;
}

export const EnvironmentMetadata: EnvironmentMetadataType = {
  seasons: {
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
  },
};
