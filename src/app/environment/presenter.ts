import { ref, Ref } from "vue";

import { IRender } from "../ecs";
import { SeasonId, WeatherId } from "../core/metadata";
import { SeasonsMetadata } from "../core/metadata/environment";
import { WeatherMetadata } from "../core/metadata/weather";

import { EntityAdmin } from "../game/entity-admin";
import { EnvironmentEntity } from ".";

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
    entity.changes.apply({
      day: () => {
        this.calendar.value.day = entity.state.day;
      },
      season: () => {
        this.calendar.value.seasonId = entity.state.season;
      },
      year: () => {
        this.calendar.value.year = entity.state.year;
      },
      weatherId: () => {
        this.weather.value.weatherId = entity.state.weatherId;
      },
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
  title = "";

  set weatherId(id: WeatherId) {
    this.title = WeatherMetadata[id].label ?? "";
  }
}
