import { watchSyncEffect } from "vue";

import { SeasonId, WeatherId } from "@/app/interfaces";
import { TimeConstants } from "@/app/state";
import { choose } from "@/app/utils/probability";

import { EnvironmentEntity, TimeEntity } from "../entity";

import { System } from ".";

export class EnvironmentSystem extends System {
  get environment(): EnvironmentEntity {
    return this.admin.environment();
  }

  get time(): TimeEntity {
    return this.admin.time();
  }

  init(): void {
    const environment = this.environment.state;
    const calendar = this.admin.tech("calendar").state;
    watchSyncEffect(() => {
      if (calendar.researched) {
        if (environment.weather !== "neutral") {
          environment.calendar = "calendar.full.weather";
        } else {
          environment.calendar = "calendar.full.no-weather";
        }
      } else {
        if (environment.weather !== "neutral") {
          environment.calendar = "calendar.basic.weather";
        } else {
          environment.calendar = "calendar.basic.no-weather";
        }
      }
    });
  }

  update(): void {
    const environment = this.environment;

    const days = this.time.days;
    if (days.wholeTicks > 0) {
      environment.state.day += days.wholeTicks;

      const daysPerSeason = TimeConstants.DaysPerSeason;
      while (environment.state.day >= daysPerSeason) {
        environment.state.day -= daysPerSeason;
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

    this.updateWeather();
  }

  private updateWeather() {
    this.environment.state.weather = this.chooseWeather();
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
