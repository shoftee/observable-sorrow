import { System } from "../ecs";

import { CalendarConstants } from "../core/metadata";

import { CalendarComponent, SeasonId } from "../environment";
import { TimerComponent } from "../ecs/common";

export class TimeSystem extends System {
  private get ticks(): TimerComponent {
    return this.admin.timers().ticks;
  }

  private get days(): TimerComponent {
    return this.admin.timers().days;
  }

  private get calendar(): CalendarComponent {
    return this.admin.environment().calendar;
  }

  update(dt: number): void {
    // Advance timers
    this.ticks.update(dt);
    this.days.update(dt);

    this.updateCalendar(this.calendar, this.days.delta);
  }

  private updateCalendar(calendar: CalendarComponent, daysDelta: number): void {
    calendar.dayOfSeason += daysDelta;
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
