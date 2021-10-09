import { computed, ComputedRef, reactive } from "vue";

import { Meta } from "@/_state";
import { SeasonId, WeatherId } from "@/_interfaces";

import { IStateManager } from ".";

export class EnvironmentPresenter {
  readonly calendar: ComputedRef<Calendar>;

  constructor(private readonly manager: IStateManager) {
    this.calendar = computed(() => this.newCalendar());
  }

  private newCalendar(): Calendar {
    const state = this.manager.environment();

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
