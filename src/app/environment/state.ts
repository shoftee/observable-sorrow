import { SeasonKind, WeatherKind } from "./metadata";

class State {
  year = 0;
  season: SeasonKind = "spring";
  weather: WeatherKind = "none";
  dayOfSeason = 0;
}

export { State as EnvironmentState };
