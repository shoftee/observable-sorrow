type SeasonId = "spring" | "summer" | "autumn" | "winter";

type SeasonMetadataType = {
  id: SeasonId;
  label: string;
};

interface IMetadata {
  seasons: Record<SeasonId, SeasonMetadataType>;
}

const Metadata: IMetadata = {
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

export {
  SeasonId as SeasonId,
  Metadata as EnvironmentMetadata,
  IMetadata as IEnvironmentMetadata,
};
