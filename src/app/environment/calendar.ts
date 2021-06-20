import { Component, ComponentState } from "@/app/ecs";
import { SeasonId } from "./metadata";

export class CalendarComponent extends Component {
  year = 0;
  season: SeasonId = "spring";
  dayOfSeason = 0;
}

export type CalendarState = ComponentState<CalendarComponent>;
