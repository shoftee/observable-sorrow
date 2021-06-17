import { LocalizationKey } from "../core/i18n";

const Constants = {
  TicksPerSecond: 5,
  SecondsPerDay: 2,
  DaysPerSeason: 100,
};

type WeatherKind = "none" | "warm" | "cold";
type SeasonKind = "spring" | "summer" | "autumn" | "winter";

type SeasonMetadataType = {
  title: LocalizationKey;
  id: SeasonKind;
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

export { Constants, SeasonKind, WeatherKind, Metadata, IMetadata };
