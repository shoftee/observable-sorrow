import { SeasonId, WeatherId } from "@/app/interfaces";

import { EcsComponent, MarkerComponent, ValueComponent } from "@/app/ecs";

export class DayTimer extends MarkerComponent {}

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
  date = "calendar.full.no-weather";
  epoch = "calendar.epoch.full";
}
