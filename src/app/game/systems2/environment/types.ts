import { EcsComponent, ValueComponent } from "@/app/ecs";

import { SeasonId, WeatherId } from "@/app/interfaces";

export const DayTimer = class extends EcsComponent {};

export class Day extends ValueComponent<number> {
  value = 0;
}

export class Season extends ValueComponent<SeasonId> {
  value: SeasonId = "spring";
}

export class Year extends ValueComponent<number> {
  value = 0;
}

export class Weather extends ValueComponent<WeatherId> {
  value: WeatherId = "neutral";
}

export class Labels extends EcsComponent {
  dateLabel = "calendar.full.no-weather";
  epochLabel = "calendar.epoch.full";
}
