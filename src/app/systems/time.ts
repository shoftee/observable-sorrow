import { System } from "../ecs";
import { TimerComponent } from "../ecs/common";

import { CalendarConstants } from "../core/metadata";

import { SeasonId } from "../environment";

export class TimeSystem extends System {
  private get ticks(): TimerComponent {
    return this.admin.timers().ticks;
  }

  private get days(): TimerComponent {
    return this.admin.timers().days;
  }

  update(dt: number): void {
    // Advance timers
    this.ticks.update(dt);
    this.days.update(dt);

    this.updateCalendar();
  }

  private updateCalendar(): void {
    const environment = this.admin.environment();
    const calendar = environment.calendar;

    if (this.days.ticked) {
      calendar.day += this.days.delta;
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
