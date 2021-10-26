import { computed, reactive } from "vue";

import { Meta } from "@/app/state";
import { SeasonId, WeatherId } from "@/app/interfaces";

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
      year: computed(() => state.year),
      weather: computed(() => state.weather),
      calendarLabel: computed(() => state.calendarLabel),
      epochLabel: computed(() => state.epochLabel),
      seasonLabel: computed(() => Meta.season(state.season).label),
      weatherLabel: computed(() => Meta.weather(state.weather).label),
    });
  }
}

export interface Calendar {
  day: number;
  season: SeasonId;
  year: number;
  weather: WeatherId;
  calendarLabel: string;
  epochLabel: string;
  seasonLabel: string;
  weatherLabel: string | undefined;
}
