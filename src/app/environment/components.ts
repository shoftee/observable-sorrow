import { Component, ComponentState } from "@/app/ecs";
import { WeatherId } from "../core/metadata";
import { SeasonId } from "../core/metadata/environment";

export class CalendarComponent extends Component {
  year = 0;
  season: SeasonId = "spring";
  day = 0;
}

export type CalendarState = ComponentState<CalendarComponent>;

export class WeatherComponent extends Component {
  weatherId: WeatherId = "neutral";
  adjustment = 0;
}

export type WeatherState = ComponentState<WeatherComponent>;
