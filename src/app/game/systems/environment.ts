import { watchSyncEffect } from "vue";

import { SeasonId, WeatherId } from "@/app/interfaces";
import { TimeConstants } from "@/app/state";
import { choose } from "@/app/utils/probability";

import { System } from ".";

export class EnvironmentSystem extends System {
  init(): void {
    const environment = this.admin.environment().state;
    const calendar = this.admin.tech("calendar").state;
    watchSyncEffect(() => {
      if (calendar.researched) {
        environment.epochLabel = "calendar.epoch.full";
        if (environment.weather !== "neutral") {
          environment.calendarLabel = "calendar.full.weather";
        } else {
          environment.calendarLabel = "calendar.full.no-weather";
        }
      } else {
        environment.epochLabel = "calendar.epoch.basic";
        if (environment.weather !== "neutral") {
          environment.calendarLabel = "calendar.basic.weather";
        } else {
          environment.calendarLabel = "calendar.basic.no-weather";
        }
      }
    });
  }

  update(): void {
    const environment = this.admin.environment().state;

    const { days } = this.admin.time();
    if (days.wholeTicks > 0) {
      environment.day += days.wholeTicks;

      const daysPerSeason = TimeConstants.DaysPerSeason;
      while (environment.day >= daysPerSeason) {
        environment.day -= daysPerSeason;
        this.progressToNextSeason();
      }
    }
  }

  private progressToNextSeason() {
    const environment = this.admin.environment().state;
    const newSeason = this.calculateNextSeason(environment.season);
    environment.season = newSeason;

    if (newSeason === "spring") {
      environment.year++;
    }

    environment.weather = this.chooseWeather();
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
    const environment = this.admin.environment().state;
    // Weather is handicapped to neutral during the first four years.
    const year = environment.year;
    if (0 <= year && year <= 3) {
      return "neutral";
    }

    return choose(
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
      () => this.admin.prng().environment(),
    );
  }
}
