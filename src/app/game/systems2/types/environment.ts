import { EcsComponent, ValueComponent } from "@/app/ecs";

import { SeasonId, WeatherId } from "@/app/interfaces";

export const DayTimer = class extends EcsComponent {};

function value<T>(defaultValue: T) {
  return class extends ValueComponent<T> {
    value = defaultValue;
  };
}

export const Day = value(0);
export const Season = value("spring" as SeasonId);
export const Year = value(0);
export const Weather = value("neutral" as WeatherId);
export class Labels extends EcsComponent {
  dateLabel = "calendar.full.no-weather";
  epochLabel = "calendar.epoch.full";
}
