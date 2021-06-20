import { Ref, ref, unref, shallowReadonly } from "vue";
import { TickerComponent } from "../components/common";
import { IEntity, Entity } from "../ecs";
import { CalendarComponent, CalendarState } from "./calendar";
import { SeasonId } from "./metadata";

const Constants = {
  TicksPerDay: 10,
  DaysPerSeason: 100,
};

export interface IEnvironmentEntity extends IEntity {
  calendar(): Ref<CalendarState>;
}

export class EnvironmentEntity extends Entity implements IEnvironmentEntity {
  readonly id = "environment";

  private _ticker = new TickerComponent();
  private _calendar = new CalendarComponent();

  private _calendarRef!: Ref<CalendarState>;

  constructor() {
    super();
  }

  calendar(): Ref<CalendarState> {
    return shallowReadonly(this._calendarRef);
  }

  init(): void {
    this._ticker = new TickerComponent(Constants.TicksPerDay);
    this.components.add(this._ticker);

    this._calendar = new CalendarComponent();
    this.components.add(this._calendar);

    this._calendarRef = ref(this._calendar) as Ref<CalendarState>;
  }

  update(deltaTime: number): void {
    this._ticker.update(deltaTime);
    if (this._ticker.ticked) {
      this.updateCalendar(unref(this._calendarRef));
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
