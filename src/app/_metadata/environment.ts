const Constants = {
  TicksPerSecond: 5,
  SecondsPerDay: 2,
  DaysPerSeason: 100,
};

type WeatherKind = "none" | "warm" | "cold";
type SeasonKind = "spring" | "summer" | "autumn" | "winter";

type SeasonMetadataType = {
  id: SeasonKind;
  title: string;
};

interface IMetadata {
  seasons: Record<SeasonKind, SeasonMetadataType>;
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
  Constants as EnvironmentConstants,
  SeasonKind,
  WeatherKind,
  Metadata as EnvironmentMetadata,
  IMetadata as IEnvironmentMetadata,
};
