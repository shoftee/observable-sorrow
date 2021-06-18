import { SeasonKind, WeatherKind } from "../_metadata/environment";

interface IState {
  year: number;
  season: SeasonKind;
  weather: WeatherKind;
  dayOfSeason: number;
}

function newEnvironment(): IState {
  return {
    year: 0,
    season: "spring",
    weather: "none",
    dayOfSeason: 0,
  };
}

export { IState as IEnvironmentState, newEnvironment };
