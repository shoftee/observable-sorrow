import { reactive, computed } from "vue";

import { SeasonId, WeatherId } from "@/app/interfaces";
import { Meta } from "@/app/state";

import { IStateManager } from "..";

export function newCalendarView(manager: IStateManager): CalendarView {
  const state = manager.state.calendar;

  return reactive({
    day: computed(() => state.day),
    season: computed(() => state.season),
    year: computed(() => state.year),
    weather: computed(() => state.weather),
    dateLabel: computed(() => state.labels.date),
    epochLabel: computed(() => state.labels.epoch),
    seasonLabel: computed(() => Meta.season(state.season).label),
    weatherLabel: computed(() => Meta.weather(state.weather).label),
  });
}

export interface CalendarView {
  day: number;
  season: SeasonId;
  year: number;
  weather: WeatherId;
  dateLabel: string;
  epochLabel: string;
  seasonLabel: string;
  weatherLabel: string | undefined;
}
