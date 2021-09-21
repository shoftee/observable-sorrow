import { System } from "../ecs";

import {
  CalendarConstants,
  WeatherId,
  WeatherMetadata,
} from "../core/metadata";

import { EnvironmentEntity, SeasonId } from "../environment";
import { DefaultChooser } from "../utils/probability";

export class EnvironmentSystem extends System {
  update(): void {
    const environment = this.admin.environment();
    const calendar = environment.calendar;

    const days = this.admin.timers().days;
    if (days.wholeTicks > 0) {
      calendar.day += days.wholeTicks;
      environment.notifier.mark("day");

      while (calendar.day >= CalendarConstants.DaysPerSeason) {
        calendar.day -= CalendarConstants.DaysPerSeason;
        this.progressToNextSeason(environment);
      }
    }
  }

  private progressToNextSeason(environment: EnvironmentEntity) {
    const newSeason = this.calculateNextSeason(environment.calendar.season);
    environment.calendar.season = newSeason;
    environment.notifier.mark("season");

    if (newSeason === "spring") {
      environment.calendar.year++;
      environment.notifier.mark("year");
    }

    let weatherSeasonAdjustment = 0;
    if (newSeason === "spring") {
      weatherSeasonAdjustment = 0.5;
    } else if (newSeason === "winter") {
      weatherSeasonAdjustment = -0.75;
    }

    const weatherId: WeatherId = this.calculateNextWeather();
    if (environment.weather.weatherId != weatherId) {
      environment.weather.weatherId = weatherId;
      environment.notifier.mark("weatherId");
    }

    const weatherAdjustment =
      weatherSeasonAdjustment + WeatherMetadata[weatherId].adjustment;
    if (environment.weather.adjustment != weatherAdjustment) {
      environment.weather.adjustment = weatherAdjustment;
      environment.notifier.mark("adjustment");
    }
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

  private calculateNextWeather(): WeatherId {
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
