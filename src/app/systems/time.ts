import { System } from "../ecs";

import { CalendarConstants } from "../core/metadata";

import { CalendarComponent, SeasonId } from "../environment";

export class TimeSystem extends System {
  update(dt: number): void {
    const environment = this.admin.environment();
    environment.ticker.update(dt);
    if (environment.ticker.ticked) {
      this.updateCalendar(environment.calendar);
    }
  }

  private updateCalendar(calendar: CalendarComponent): void {
    calendar.dayOfSeason++;
    while (calendar.dayOfSeason >= CalendarConstants.DaysPerSeason) {
      calendar.dayOfSeason -= CalendarConstants.DaysPerSeason;
      calendar.season = this.calculateNextSeason(calendar.season);
      if (calendar.season === "spring") {
        calendar.year++;
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
