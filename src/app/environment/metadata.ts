type SeasonId = "spring" | "summer" | "autumn" | "winter";

type SeasonMetadataType = {
  id: SeasonId;
  title: string;
};

interface IMetadata {
  seasons: Record<SeasonId, SeasonMetadataType>;
}

const Metadata: IMetadata = {
  seasons: {
    spring: {
      id: "spring",
      title: "environment.seasons.spring.title",
    },
    summer: {
      id: "summer",
      title: "environment.seasons.summer.title",
    },
    autumn: {
      id: "autumn",
      title: "environment.seasons.autumn.title",
    },
    winter: {
      id: "winter",
      title: "environment.seasons.winter.title",
    },
  },
};

export {
  SeasonId as SeasonId,
  Metadata as EnvironmentMetadata,
  IMetadata as IEnvironmentMetadata,
};
