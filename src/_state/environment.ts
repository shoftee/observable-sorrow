import { SeasonId, WeatherId } from "@/_interfaces";

export type SeasonMetadataType = Readonly<{
  id: SeasonId;
  label: string;
}>;

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

export type WeatherMetadataType = Readonly<{
  id: WeatherId;
  label?: string;
}>;

export const WeatherMetadata: Record<WeatherId, WeatherMetadataType> = {
  neutral: {
    id: "neutral",
  },
  warm: {
    id: "warm",
    label: "environment.weather.warm",
  },
  cold: {
    id: "cold",
    label: "environment.weather.cold",
  },
};

export class EnvironmentState {
  year = 0;
  season: SeasonId = "spring";
  day = 0;
  weatherId: WeatherId = "neutral";
}
