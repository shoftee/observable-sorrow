import { computed, ComputedRef, reactive } from "vue";

import { EnvironmentState, SeasonsMetadata, WeatherMetadata } from "@/_state";
import { SeasonId, WeatherId } from "@/_interfaces";

import { IRootPresenter } from ".";

export interface Calendar {
  day: number;
  season: SeasonId;
  year: number;
  weather: WeatherId;
  seasonLabel: string;
  weatherLabel: string | undefined;
  calendarLabel:
    | "environment.calendar.full.weather"
    | "environment.calendar.full.no-weather";
}

export interface IEnvironmentPresenter {
  readonly calendar: ComputedRef<Calendar>;
}

export class EnvironmentPresenter implements IEnvironmentPresenter {
  readonly calendar: ComputedRef<Calendar>;

  constructor(private readonly root: IRootPresenter) {
    this.calendar = computed(() => this.newCalendar());
  }

  private newCalendar(): Calendar {
    const state = this.root.get<EnvironmentState>("environment");

    return reactive({
      day: computed(() => state.day),
      season: computed(() => state.season),
      seasonLabel: computed(() => SeasonsMetadata[state.season].label),
      year: computed(() => state.year),
      weather: computed(() => state.weatherId),
      weatherLabel: computed(() => WeatherMetadata[state.weatherId].label),
      calendarLabel: computed(() =>
        WeatherMetadata[state.weatherId].label
          ? "environment.calendar.full.weather"
          : "environment.calendar.full.no-weather",
      ),
    });
  }
}
