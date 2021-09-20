import { ref, Ref, unref } from "vue";

import { IRender } from "../ecs";
import { SeasonId, SeasonsMetadata } from "../core/metadata/environment";
import { EntityAdmin } from "../game/entity-admin";
import { EnvironmentEntity } from ".";
import { WeatherId, WeatherMetadata } from "../core/metadata";

export interface IEnvironmentPresenter extends IRender {
  readonly calendar: Ref<CalendarViewModel>;
  readonly weather: Ref<WeatherViewModel>;
}

export class EnvironmentPresenter implements IEnvironmentPresenter {
  private readonly environment: EnvironmentEntity;

  readonly calendar: Ref<CalendarViewModel>;
  readonly weather: Ref<WeatherViewModel>;

  constructor(admin: EntityAdmin) {
    this.environment = admin.environment();

    this.calendar = ref(new CalendarViewModel()) as Ref<CalendarViewModel>;
    this.weather = ref(new WeatherViewModel()) as Ref<WeatherViewModel>;
  }

  render(): void {
    const entity = this.environment;
    const calendarRaw = unref(this.calendar);
    const weatherRaw = unref(this.weather);

    const calendar = entity.calendar;
    const weather = entity.weather;

    entity.notifier.apply((key) => {
      if (key == "day") calendarRaw.day = calendar.day;
      if (key == "season") calendarRaw.seasonId = calendar.season;
      if (key == "year") calendarRaw.year = calendar.year;

      if (key == "weatherId") {
        weatherRaw.weatherId = weather.weatherId;
      }

      if (key == "adjustment") {
        weatherRaw.adjustment = weather.adjustment;
      }
    });
  }
}

export class CalendarViewModel {
  day: number;
  season: string;
  year: number;

  constructor() {
    this.day = 0;
    this.season = SeasonsMetadata.spring.label;
    this.year = 0;
  }

  set seasonId(id: SeasonId) {
    this.season = SeasonsMetadata[id].label;
  }
}

export class WeatherViewModel {
  adjustment: number;
  title: string;

  constructor() {
    this.adjustment = 0;
    this.title = "";
  }

  set weatherId(id: WeatherId) {
    this.title = WeatherMetadata[id].label ?? "";
  }
}
