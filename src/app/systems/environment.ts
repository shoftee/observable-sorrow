import { SeasonId, WeatherId } from "@/_interfaces";

import { System } from "../ecs";
import { CalendarConstants } from "../constants/calendar";
import { DefaultChooser } from "../utils/probability";

import { WeatherMetadata } from "../core/metadata/weather";

import { EnvironmentEntity } from "../environment";

export class EnvironmentSystem extends System {
  get environment(): EnvironmentEntity {
    return this.admin.environment();
  }

  init(): void {
    this.updateWeather("spring");
  }

  update(): void {
    const environment = this.environment;

    const days = this.admin.timers().days;
    if (days.wholeTicks > 0) {
      environment.state.day += days.wholeTicks;

      while (environment.state.day >= CalendarConstants.DaysPerSeason) {
        environment.state.day -= CalendarConstants.DaysPerSeason;
        this.progressToNextSeason();
      }
    }
  }

  private progressToNextSeason() {
    const environment = this.environment;
    const newSeason = this.calculateNextSeason(environment.state.season);
    environment.state.season = newSeason;

    if (newSeason === "spring") {
      environment.state.year++;
    }

    this.updateWeather(newSeason);
  }

  private updateWeather(season: string) {
    const effects = this.admin.effects();
    const seasonModifier = effects.entry("weather-season-modifier");
    if (season === "spring") {
      seasonModifier.set(0.5);
    } else if (season === "winter") {
      seasonModifier.set(-0.75);
    } else {
      seasonModifier.set(0);
    }

    const weatherId: WeatherId = this.chooseWeather();
    this.environment.state.weatherId = weatherId;

    const severityModifier = effects.entry("weather-severity-modifier");
    severityModifier.set(WeatherMetadata[weatherId].adjustment);
  }

  private calculateNextSeason(currentSeason: SeasonId): SeasonId {
    switch (currentSeason) {
      case "spring":
        return "summer";
      case "summer":
        return "autumn";
      case "autumn":
        return "winter";
      case "winter":
        return "spring";
    }
  }

  private chooseWeather(): WeatherId {
    // Weather is handicapped to neutral during the first four years.
    const year = this.environment.state.year;
    if (0 <= year && year <= 3) {
      return "neutral";
    }

    return DefaultChooser.choose(
      [
        {
          frequency: 175,
          result: "cold",
        },
        {
          frequency: 175,
          result: "warm",
        },
        {
          result: "neutral",
        },
      ],
      1000,
    );
  }
}
