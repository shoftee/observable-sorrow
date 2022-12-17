import { SeasonId, WeatherId } from "@/app/interfaces";

import { EcsComponent, MarkerComponent, ValueComponent } from "@/app/ecs";

export class DayTimer extends MarkerComponent {}

export class Day extends ValueComponent<number> {
  constructor() {
    super(0);
  }
}

export class Season extends ValueComponent<SeasonId> {
  constructor() {
    super("spring");
  }
}

export class Year extends ValueComponent<number> {
  constructor() {
    super(0);
  }
}

export class Weather extends ValueComponent<WeatherId> {
  constructor() {
    super("neutral");
  }
}

export class Labels extends EcsComponent {
  date = "calendar.full.no-weather";
  epoch = "calendar.epoch.full";
}
