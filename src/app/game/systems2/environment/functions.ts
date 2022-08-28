import { ChoiceSpecification, choose } from "@/app/utils/probability";

import { SeasonId, WeatherId } from "@/app/interfaces";

const WeatherChoices: ChoiceSpecification<WeatherId> = {
  options: [
    { frequency: 175, result: "cold" },
    { frequency: 175, result: "warm" },
    { result: "neutral" },
  ],
  total: 1000,
};

export function nextWeather(random: () => number): WeatherId {
  return choose(WeatherChoices, random);
}

const NextSeasonMap: Record<SeasonId, SeasonId> = {
  ["spring"]: "summer",
  ["summer"]: "autumn",
  ["autumn"]: "winter",
  ["winter"]: "spring",
};

export function nextSeason(last: SeasonId): SeasonId {
  return NextSeasonMap[last];
}

const WeatherSeasonRatioMap = {
  spring: +0.5,
  summer: 0,
  autumn: 0,
  winter: -0.75,
};

export function getWeatherSeasonRatio(season: SeasonId) {
  return WeatherSeasonRatioMap[season];
}

const WeatherSeverityRatioMap = {
  warm: +0.15,
  cold: -0.15,
  neutral: 0,
};

export function getWeatherSeverityRatio(weather: WeatherId) {
  return WeatherSeverityRatioMap[weather];
}
