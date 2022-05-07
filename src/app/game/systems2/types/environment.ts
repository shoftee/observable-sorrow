import { EcsComponent } from "@/app/ecs";

import { SeasonId, WeatherId } from "@/app/interfaces";

export const EnvironmentMarker = class extends EcsComponent {};

export class Calendar extends EcsComponent {
  day = 0; // integer
  season: SeasonId = "spring";
  year = 0; // integer
  weather: WeatherId = "neutral";
  dateLabel = "calendar.basic.no-weather";
  epochLabel = "calendar.epoch.basic";
}
