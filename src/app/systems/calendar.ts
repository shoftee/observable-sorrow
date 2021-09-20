import { System } from "../ecs";
import { TimerComponent } from "../ecs/common";

import { CalendarConstants } from "../core/metadata";

import { SeasonId } from "../environment";

export class CalendarSystem extends System {
  update(): void {
    const environment = this.admin.environment();
    const calendar = environment.calendar;

    const days = this.admin.timers().days;
    if (days.wholeTicks > 0) {
      calendar.day += days.wholeTicks;
      environment.notifier.mark("day");

      while (calendar.day >= CalendarConstants.DaysPerSeason) {
        calendar.day -= CalendarConstants.DaysPerSeason;
        calendar.season = this.calculateNextSeason(calendar.season);
        environment.notifier.mark("season");

        if (calendar.season === "spring") {
          calendar.year++;
          environment.notifier.mark("year");
        }
      }
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
}
