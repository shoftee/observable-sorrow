import { reactive, computed } from "vue";

import { SeasonId, WeatherId } from "@/app/interfaces";
import { Meta } from "@/app/state";

import { StateSchema } from "@/app/game/systems2/core";

export function newCalendarView(schema: StateSchema): CalendarView {
  const { calendar: state } = schema;

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
