import { TickerComponent } from "../components/common";
import { Entity } from "../ecs";
import { CalendarComponent, CalendarState } from "./calendar";
import { SeasonId } from "./metadata";

const Constants = {
  TicksPerDay: 10,
  DaysPerSeason: 100,
};

export class EnvironmentEntity extends Entity {
  readonly id = "environment";

  private _ticker = new TickerComponent();
  calendar!: CalendarComponent;

  constructor() {
    super();
  }

  init(): void {
    this._ticker = this.components.add(
      new TickerComponent(Constants.TicksPerDay),
    );

    this.calendar = this.components.add(new CalendarComponent());
  }

  update(deltaTime: number): void {
    this._ticker.update(deltaTime);
    if (this._ticker.ticked) {
      this.updateCalendar(this.calendar);
    }
  }

  private updateCalendar(calendar: CalendarState): void {
    calendar.dayOfSeason++;
    while (calendar.dayOfSeason >= Constants.DaysPerSeason) {
      calendar.dayOfSeason -= Constants.DaysPerSeason;
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
