import { watchSyncEffect } from "vue";

import { SeasonId, WeatherId } from "@/app/interfaces";
import { TimeConstants } from "@/app/state";
import { ChoiceSpecification, choose } from "@/app/utils/probability";

import { System } from ".";

export class EnvironmentSystem extends System {
  init(): void {
    watchSyncEffect(() => {
      // change epoch label depending on Calendar research.
      const calendar = this.admin.tech("calendar").state;
      const environment = this.admin.environment().state;
      environment.epochLabel = calendar.researched
        ? "calendar.epoch.full"
        : "calendar.epoch.basic";
    });
    watchSyncEffect(() => {
      // change calendar label depending on Calendar research and weather
      const environment = this.admin.environment().state;
      const calendar = this.admin.tech("calendar").state;

      const hasWeather = environment.weather !== "neutral";
      if (calendar.researched) {
        environment.calendarLabel = hasWeather
          ? "calendar.full.weather"
          : "calendar.full.no-weather";
      } else {
        environment.calendarLabel = hasWeather
          ? "calendar.basic.weather"
          : "calendar.basic.no-weather";
      }
    });
  }

  update(): void {
    const environment = this.admin.environment().state;
    let currentDay = environment.day;

    const { days } = this.admin.time();
    if (days.isNewTick) {
      currentDay += 1;

      if (currentDay >= TimeConstants.DaysPerSeason) {
        currentDay = 0;

        const newSeason = this.calculateNextSeason(environment.season);
        environment.season = newSeason;

        let year = environment.year;
        if (newSeason === "spring") {
          environment.year = ++year;
        }

        if (year > 3) {
          // Weather is handicapped to neutral during the first four years.
          environment.weather = this.chooseWeather();
        }
      }

      environment.day = currentDay;
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

  private chooseWeather(): WeatherId {
    return choose(WeatherChoiceSpecification, () =>
      this.admin.prng().environment(),
    );
  }
}

const WeatherChoiceSpecification: ChoiceSpecification<WeatherId> = {
  options: [
    { frequency: 175, result: "cold" },
    { frequency: 175, result: "warm" },
    { result: "neutral" },
  ],
  total: 1000,
};
