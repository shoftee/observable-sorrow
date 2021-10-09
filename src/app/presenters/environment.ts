import { computed, reactive } from "vue";

import { Meta } from "@/_state";
import { SeasonId, WeatherId } from "@/_interfaces";

import { IStateManager } from ".";

export class EnvironmentPresenter {
  readonly calendar: Calendar;

  constructor(manager: IStateManager) {
    this.calendar = this.newCalendar(manager);
  }

  private newCalendar(manager: IStateManager): Calendar {
    const state = manager.environment();

    return reactive({
      day: computed(() => state.day),
      season: computed(() => state.season),
      seasonLabel: computed(() => Meta.season(state.season).label),
      year: computed(() => state.year),
      weather: computed(() => state.weatherId),
      weatherLabel: computed(() => Meta.weather(state.weatherId).label),
      calendarLabel: computed(() =>
        Meta.weather(state.weatherId).label
          ? "environment.calendar.full.weather"
          : "environment.calendar.full.no-weather",
      ),
    });
  }
}

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
