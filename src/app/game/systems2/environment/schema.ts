import { SeasonId, WeatherId } from "@/app/interfaces";

export type CalendarSchema = {
  day: number;
  season: SeasonId;
  year: number;
  weather: WeatherId;
  dateLabel: string;
  epochLabel: string;
};
